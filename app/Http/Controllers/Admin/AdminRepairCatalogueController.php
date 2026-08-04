<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepairDevice;
use App\Models\RepairModel;
use App\Models\RepairPrice;
use App\Models\RepairType;
use App\Support\RepairCatalogue;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Admin → Repairs → Catalogue.
 *
 * Everything the repair selector and booking form offer — device families,
 * models and their variants, repair types, per-model prices, and the service
 * options (levy, time slots, collection modes, disclaimers) — is edited here
 * instead of in App\Support\RepairCatalogue's constants.
 */
class AdminRepairCatalogueController extends Controller
{
    /**
     * Tables this screen cannot function without.
     */
    private const REQUIRED_TABLES = ['repair_types', 'repair_devices', 'repair_models', 'repair_prices'];

    public function index()
    {
        // Code deploys and migrations are separate steps here (Git pull via
        // hPanel, then the /__setup route), so there is always a window where
        // the controller exists but its tables do not. Degrade to an
        // explanatory banner instead of a 500 with a stack trace.
        if ($missing = $this->missingTables()) {
            return Inertia::render('Admin/Repairs/Catalogue', [
                'types' => [],
                'devices' => [],
                'options' => RepairCatalogue::SERVICE_DEFAULTS,
                'isSeeded' => false,
                'pendingMigration' => $missing,
            ]);
        }

        return Inertia::render('Admin/Repairs/Catalogue', [
            'types' => RepairType::orderBy('sort_order')->orderBy('id')->get(),
            'devices' => RepairDevice::with(['models' => fn ($query) => $query->with('prices')])
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
            'options' => RepairCatalogue::serviceOptions(),
            'isSeeded' => RepairDevice::exists(),
            'pendingMigration' => [],
        ]);
    }

    /**
     * @return array<int, string>  the required tables that do not exist yet
     */
    private function missingTables(): array
    {
        return array_values(array_filter(
            self::REQUIRED_TABLES,
            fn (string $table) => ! rescue(fn () => Schema::hasTable($table), false, false)
        ));
    }

    // ---------------------------------------------------------------- types

    public function storeType(Request $request)
    {
        $data = $this->validatedType($request);

        // The key is persisted on every booking, so derive it once from the
        // label and never change it afterwards.
        $data['key'] = $this->uniqueKey($data['label'], RepairType::class);

        RepairType::create($data);

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Repair type added.');
    }

    public function updateType(Request $request, string $id)
    {
        $type = RepairType::findOrFail($id);

        // key deliberately omitted — renaming it would orphan existing bookings.
        $type->update($this->validatedType($request));

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Repair type updated.');
    }

    public function destroyType(string $id)
    {
        $type = RepairType::findOrFail($id);

        // Prices cascade with the type; bookings keep their stored key string
        // and still render a label through RepairCatalogue::repairTypeLabels().
        $type->delete();

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Repair type removed.');
    }

    // --------------------------------------------------------------- devices

    public function storeDevice(Request $request)
    {
        $data = $this->validatedDevice($request);
        $data['key'] = $this->uniqueKey($data['label'], RepairDevice::class);
        $data['sort_order'] = $data['sort_order'] ?? (int) RepairDevice::max('sort_order') + 1;

        RepairDevice::create($data);

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Device category added.');
    }

    public function updateDevice(Request $request, string $id)
    {
        RepairDevice::findOrFail($id)->update($this->validatedDevice($request));

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Device category updated.');
    }

    public function destroyDevice(string $id)
    {
        RepairDevice::findOrFail($id)->delete(); // models + prices cascade

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Device category removed.');
    }

    // ---------------------------------------------------------------- models

    public function storeModel(Request $request)
    {
        $data = $this->validatedModel($request);
        $data['sort_order'] = $data['sort_order']
            ?? (int) RepairModel::where('repair_device_id', $data['repair_device_id'])->max('sort_order') + 1;

        $model = RepairModel::create($data);

        $this->syncPrices($model, $request->input('prices', []));

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Model added.');
    }

    public function updateModel(Request $request, string $id)
    {
        $model = RepairModel::findOrFail($id);

        $model->update($this->validatedModel($request));

        $this->syncPrices($model, $request->input('prices', []));

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Model updated.');
    }

    public function destroyModel(string $id)
    {
        RepairModel::findOrFail($id)->delete(); // prices cascade

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Model removed.');
    }

    // --------------------------------------------------------------- options

    /**
     * Service-wide settings for the booking flow.
     */
    public function updateOptions(Request $request)
    {
        $data = $request->validate([
            'ineligible_levy' => 'required|numeric|min:0|max:100000',
            'time_slots' => 'required|array|min:1|max:24',
            'time_slots.*' => 'required|string|max:40',
            'offer_in_store' => 'boolean',
            'offer_home_collection' => 'boolean',
            'home_collection_fee' => 'required|numeric|min:0|max:100000',
            'turnaround_note' => 'nullable|string|max:500',
            'disclaimer' => 'nullable|string|max:500',
            'booking_enabled' => 'boolean',
        ]);

        $inStore = $request->boolean('offer_in_store');
        $homeCollection = $request->boolean('offer_home_collection');

        // Turning both off would leave the booking form with nothing to pick.
        if (! $inStore && ! $homeCollection) {
            return redirect()->back()->with('error', 'Keep at least one service mode switched on.');
        }

        Settings::putMany('repairs', [
            'ineligible_levy' => (float) $data['ineligible_levy'],
            'time_slots' => array_values(array_filter(array_map('trim', $data['time_slots']))),
            'offer_in_store' => $inStore,
            'offer_home_collection' => $homeCollection,
            'home_collection_fee' => (float) $data['home_collection_fee'],
            'turnaround_note' => $data['turnaround_note'] ?? '',
            'disclaimer' => $data['disclaimer'] ?? '',
            'booking_enabled' => $request->boolean('booking_enabled'),
        ]);

        return redirect()->back()->with('success', 'Repair service options saved.');
    }

    /**
     * Load the built-in catalogue into an empty install.
     */
    public function seedDefaults()
    {
        if (RepairDevice::exists()) {
            return redirect()->back()->with('error', 'The catalogue already has device categories — nothing was imported.');
        }

        (new \Database\Seeders\RepairCatalogueSeeder)->run();

        RepairCatalogue::flush();

        return redirect()->back()->with('success', 'Starter catalogue imported. Edit the prices to match your price list.');
    }

    // ----------------------------------------------------------------- utils

    /**
     * Write the submitted price grid for one model.
     *
     * A blank or absent price means "we do not offer that repair on this
     * model", so the row is removed rather than stored as zero.
     *
     * @param  array<int|string, mixed>  $prices  repair_type_id => price
     */
    private function syncPrices(RepairModel $model, array $prices): void
    {
        $validTypeIds = RepairType::pluck('id')->all();

        foreach ($prices as $typeId => $price) {
            if (! in_array((int) $typeId, $validTypeIds, true)) {
                continue;
            }

            if ($price === null || $price === '' || ! is_numeric($price) || (float) $price < 0) {
                RepairPrice::where('repair_model_id', $model->id)
                    ->where('repair_type_id', $typeId)
                    ->delete();

                continue;
            }

            RepairPrice::updateOrCreate(
                ['repair_model_id' => $model->id, 'repair_type_id' => $typeId],
                ['price' => (float) $price, 'is_available' => true]
            );
        }
    }

    /**
     * A URL-safe key derived from the label, made unique against the table.
     */
    private function uniqueKey(string $label, string $modelClass): string
    {
        $base = Str::slug($label, '_') ?: 'item';
        $key = $base;
        $suffix = 2;

        while ($modelClass::where('key', $key)->exists()) {
            $key = $base . '_' . $suffix++;
        }

        return $key;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedType(Request $request): array
    {
        $data = $request->validate([
            'label' => 'required|string|max:80',
            'description' => 'nullable|string|max:255',
            'is_same_day' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data['is_same_day'] = $request->boolean('is_same_day');
        $data['is_active'] = $request->boolean('is_active', true);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedDevice(Request $request): array
    {
        $data = $request->validate([
            'label' => 'required|string|max:80',
            'variant_label' => 'required|string|max:40',
            'image_path' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedModel(Request $request): array
    {
        $data = $request->validate([
            'repair_device_id' => ['required', Rule::exists('repair_devices', 'id')],
            'name' => 'required|string|max:120',
            'variants' => 'nullable|array|max:20',
            'variants.*' => 'required|string|max:40',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data['variants'] = array_values(array_filter(array_map('trim', $data['variants'] ?? [])));
        $data['is_active'] = $request->boolean('is_active', true);

        return $data;
    }
}
