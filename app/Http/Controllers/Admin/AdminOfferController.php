<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Admin CRUD, ordering, scheduling and enable/disable for the homepage
 * "Latest Offers" carousel (Redesign Guide §4.4), plus the section's own
 * heading copy. No code deploy required to change offers.
 */
class AdminOfferController extends Controller
{
    /**
     * Defaults for the carousel's surrounding copy, overridable in the admin UI.
     */
    public const SECTION_DEFAULTS = [
        'is_enabled' => true,
        'eyebrow' => 'Deals & Promotions',
        'heading' => 'Latest offers.',
        'subheading' => '',
    ];

    public function index()
    {
        return Inertia::render('Admin/Offers/Index', [
            'offers' => Offer::orderBy('sort_order')->orderBy('id')->get(),
            'section' => Settings::group('offers', self::SECTION_DEFAULTS),
        ]);
    }

    public function store(Request $request)
    {
        Offer::create($this->validated($request));

        return redirect()->route('admin.offers.index')->with('success', 'Offer created successfully.');
    }

    public function update(Request $request, string $id)
    {
        $offer = Offer::findOrFail($id);

        $offer->update($this->validated($request));

        return redirect()->route('admin.offers.index')->with('success', 'Offer updated successfully.');
    }

    public function destroy(string $id)
    {
        Offer::findOrFail($id)->delete();

        return redirect()->route('admin.offers.index')->with('success', 'Offer deleted successfully.');
    }

    /**
     * Toggle active/inactive without deleting.
     */
    public function toggle(string $id)
    {
        $offer = Offer::findOrFail($id);
        $offer->update(['is_active' => ! $offer->is_active]);

        return redirect()->route('admin.offers.index')->with('success', 'Offer visibility updated.');
    }

    /**
     * Nudge an offer up or down the carousel.
     *
     * Sort positions are rewritten as a dense 0..n sequence first, so rows that
     * were created with duplicate or missing sort_order values still move
     * predictably.
     */
    public function reorder(Request $request, string $id)
    {
        $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]]);

        $offers = Offer::orderBy('sort_order')->orderBy('id')->get()->values()->all();

        $index = null;
        foreach ($offers as $position => $offer) {
            if ((string) $offer->id === $id) {
                $index = $position;
                break;
            }
        }

        abort_if($index === null, 404);

        $target = $request->input('direction') === 'up' ? $index - 1 : $index + 1;

        if ($target < 0 || $target >= count($offers)) {
            return redirect()->back(); // already at the end of the row
        }

        [$offers[$index], $offers[$target]] = [$offers[$target], $offers[$index]];

        foreach ($offers as $position => $offer) {
            $offer->update(['sort_order' => $position]);
        }

        return redirect()->back()->with('success', 'Offer order updated.');
    }

    /**
     * Copy an offer, so a seasonal variant does not have to be rebuilt by hand.
     */
    public function duplicate(string $id)
    {
        $offer = Offer::findOrFail($id);

        $copy = $offer->replicate();
        $copy->title = trim(($offer->title ?: 'Offer') . ' (copy)');
        $copy->is_active = false;      // never publish a copy by accident
        $copy->sort_order = (int) Offer::max('sort_order') + 1;
        $copy->save();

        return redirect()->route('admin.offers.index')->with('success', 'Offer duplicated. It is hidden until you activate it.');
    }

    /**
     * Heading copy and on/off switch for the whole carousel.
     */
    public function updateSection(Request $request)
    {
        $data = $request->validate([
            'eyebrow' => 'nullable|string|max:60',
            'heading' => 'nullable|string|max:120',
            'subheading' => 'nullable|string|max:255',
            'is_enabled' => 'boolean',
        ]);

        Settings::putMany('offers', [
            'eyebrow' => $data['eyebrow'] ?? '',
            'heading' => $data['heading'] ?? '',
            'subheading' => $data['subheading'] ?? '',
            'is_enabled' => $request->boolean('is_enabled'),
        ]);

        return redirect()->route('admin.offers.index')->with('success', 'Offers section settings saved.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:120',
            'subtitle' => 'nullable|string|max:160',
            'description' => 'nullable|string|max:500',
            'badge_text' => 'nullable|string|max:40',
            'image_path' => 'required|string|max:2048',
            'link_url' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:40',
            'overlay_style' => ['nullable', Rule::in(['gradient', 'solid', 'none'])],
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['overlay_style'] = $validated['overlay_style'] ?? 'gradient';
        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
    }
}
