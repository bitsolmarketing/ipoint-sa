<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\PaymentGateway;
use App\Support\PaymentProviders;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Admin → Payments. Merchant onboarding details per gateway plus the bank
 * credentials used for EFT settlement.
 *
 * Scope note: this screen stores and validates the merchant configuration and
 * decides what the customer is offered at checkout. Handing the customer off to
 * a provider's hosted page and verifying the callback is a per-provider
 * integration that still has to be wired up — nothing here charges a card.
 */
class AdminPaymentController extends Controller
{
    public function index()
    {
        $stored = PaymentGateway::orderBy('sort_order')->orderBy('id')->get()->keyBy('provider');

        // Present every provider in the registry, whether or not it has a row
        // yet, so onboarding a new one is just filling the form in.
        $gateways = collect(PaymentProviders::PROVIDERS)->map(function (array $meta, string $provider) use ($stored) {
            $row = $stored->get($provider);

            return [
                'provider' => $provider,
                'label' => $row->label ?? $meta['label'],
                'description' => $row->description ?? $meta['blurb'],
                'is_enabled' => (bool) ($row->is_enabled ?? false),
                'is_test_mode' => (bool) ($row->is_test_mode ?? true),
                'merchant_status' => $row->merchant_status ?? 'pending',
                'merchant_notes' => $row->merchant_notes ?? '',
                'sort_order' => $row->sort_order ?? 0,
                'is_configured' => $row?->isConfigured() ?? empty($meta['fields']),
                'meta' => $meta,
                // Secrets never travel to the browser — the form only needs to
                // know which ones already hold a value.
                'credentials' => $this->visibleCredentials($row, false),
                'test_credentials' => $this->visibleCredentials($row, true),
                'secrets_set' => $this->secretsSet($row),
            ];
        })->values();

        return Inertia::render('Admin/Payments/Index', [
            'gateways' => $gateways,
            // toArray() drops the encrypted account number ($hidden) and appends the
            // mask, so the full number never travels to the browser — same rule as
            // gateway secrets. Editing other fields leaves it untouched; typing a
            // new number replaces it.
            'bankAccounts' => BankAccount::orderByDesc('is_primary')->orderBy('bank_name')->get(),
            'checkout' => Settings::group('payments', [
                'instructions' => '',
                'show_bank_details_on_success' => true,
            ]),
        ]);
    }

    /**
     * Create or update one gateway's merchant configuration.
     */
    public function updateGateway(Request $request, string $provider)
    {
        abort_unless(in_array($provider, PaymentProviders::keys(), true), 404);

        $validated = $request->validate([
            'label' => 'required|string|max:80',
            'description' => 'nullable|string|max:255',
            'is_enabled' => 'boolean',
            'is_test_mode' => 'boolean',
            'merchant_status' => ['required', Rule::in(['pending', 'submitted', 'active', 'rejected'])],
            'merchant_notes' => 'nullable|string|max:2000',
            'sort_order' => 'nullable|integer|min:0',
            'credentials' => 'nullable|array',
            'test_credentials' => 'nullable|array',
        ]);

        $gateway = PaymentGateway::firstOrNew(['provider' => $provider]);

        $gateway->fill([
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_enabled' => $request->boolean('is_enabled'),
            'is_test_mode' => $request->boolean('is_test_mode'),
            'merchant_status' => $validated['merchant_status'],
            'merchant_notes' => $validated['merchant_notes'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'credentials' => $this->mergeCredentials($provider, $gateway->credentials ?: [], $request->input('credentials', [])),
            'test_credentials' => $this->mergeCredentials($provider, $gateway->test_credentials ?: [], $request->input('test_credentials', [])),
        ]);

        // Refuse to go live on an incomplete credential set rather than letting
        // customers hit a gateway that will reject every transaction.
        if ($gateway->is_enabled && ! $gateway->isConfigured()) {
            $mode = $gateway->is_test_mode ? 'test' : 'live';

            return back()->with('error', "Fill in every required {$mode} credential for {$gateway->label} before enabling it.");
        }

        $gateway->save();

        return redirect()->route('admin.payments.index')->with('success', $gateway->label . ' settings saved.');
    }

    /**
     * Wipe both credential sets and disable the gateway.
     */
    public function disconnectGateway(string $provider)
    {
        abort_unless(in_array($provider, PaymentProviders::keys(), true), 404);

        $gateway = PaymentGateway::where('provider', $provider)->first();

        if ($gateway) {
            $gateway->update([
                'credentials' => [],
                'test_credentials' => [],
                'is_enabled' => false,
                'merchant_status' => 'pending',
            ]);
        }

        return redirect()->route('admin.payments.index')->with('success', 'Credentials cleared and the gateway disabled.');
    }

    /**
     * Checkout-wide copy: EFT instructions and whether to print bank details on
     * the order confirmation.
     */
    public function updateCheckout(Request $request)
    {
        $validated = $request->validate([
            'instructions' => 'nullable|string|max:2000',
            'show_bank_details_on_success' => 'boolean',
        ]);

        Settings::putMany('payments', [
            'instructions' => $validated['instructions'] ?? '',
            'show_bank_details_on_success' => $request->boolean('show_bank_details_on_success'),
        ]);

        return redirect()->route('admin.payments.index')->with('success', 'Checkout payment settings saved.');
    }

    public function storeBankAccount(Request $request)
    {
        $account = BankAccount::create($this->validatedBankAccount($request, requireNumber: true));

        if ($request->boolean('is_primary')) {
            $account->makePrimary();
        }

        return redirect()->route('admin.payments.index')->with('success', 'Bank account added.');
    }

    public function updateBankAccount(Request $request, string $id)
    {
        $account = BankAccount::findOrFail($id);

        $account->update($this->validatedBankAccount($request));

        if ($request->boolean('is_primary')) {
            $account->makePrimary();
        }

        return redirect()->route('admin.payments.index')->with('success', 'Bank account updated.');
    }

    public function destroyBankAccount(string $id)
    {
        BankAccount::findOrFail($id)->delete();

        return redirect()->route('admin.payments.index')->with('success', 'Bank account removed.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedBankAccount(Request $request, bool $requireNumber = false): array
    {
        $data = $request->validate([
            'label' => 'nullable|string|max:80',
            'account_holder' => 'required|string|max:120',
            'bank_name' => 'required|string|max:80',
            // Blank on update means "keep the stored number" — it is never sent
            // to the browser, so the form cannot echo it back.
            'account_number' => ($requireNumber ? 'required' : 'nullable') . '|string|max:34',
            'account_type' => 'nullable|in:cheque,savings,business,transmission',
            'branch_code' => 'nullable|string|max:20',
            'swift_code' => 'nullable|string|max:20',
            'currency' => 'required|string|size:3',
            'reference_prefix' => 'nullable|string|max:20',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $data['currency'] = strtoupper($data['currency']);
        $data['is_active'] = $request->boolean('is_active', true);
        // Primary is applied through makePrimary() so the flag stays unique.
        unset($data['is_primary']);

        if (blank($data['account_number'] ?? null)) {
            unset($data['account_number']);
        }

        return $data;
    }

    /**
     * Fold submitted credentials over the stored set.
     *
     * Only keys the provider actually declares are kept, and a blank secret
     * means "leave what is already saved" — the browser never receives the old
     * value, so it cannot echo it back.
     *
     * @param  array<string, mixed>  $stored
     * @param  array<string, mixed>  $submitted
     * @return array<string, mixed>
     */
    private function mergeCredentials(string $provider, array $stored, array $submitted): array
    {
        $secrets = PaymentProviders::secretKeys($provider);
        $merged = [];

        foreach (PaymentProviders::fieldKeys($provider) as $key) {
            $incoming = $submitted[$key] ?? null;

            if (in_array($key, $secrets, true) && blank($incoming)) {
                $merged[$key] = $stored[$key] ?? null;   // keep the saved secret
                continue;
            }

            $merged[$key] = is_string($incoming) ? trim($incoming) : $incoming;
        }

        return array_filter($merged, fn ($value) => $value !== null && $value !== '');
    }

    /**
     * Non-secret credentials, safe to render in the form.
     *
     * @return array<string, mixed>
     */
    private function visibleCredentials(?PaymentGateway $gateway, bool $test): array
    {
        if (! $gateway) {
            return [];
        }

        $credentials = ($test ? $gateway->test_credentials : $gateway->credentials) ?: [];
        $secrets = PaymentProviders::secretKeys($gateway->provider);

        return collect($credentials)
            ->reject(fn ($value, $key) => in_array($key, $secrets, true))
            ->all();
    }

    /**
     * Which secret fields already hold a value, per mode — drives the
     * "Saved — leave blank to keep" hint in the UI.
     *
     * @return array{live: array<int, string>, test: array<int, string>}
     */
    private function secretsSet(?PaymentGateway $gateway): array
    {
        if (! $gateway) {
            return ['live' => [], 'test' => []];
        }

        $secrets = PaymentProviders::secretKeys($gateway->provider);

        $filled = fn (?array $credentials) => collect($secrets)
            ->filter(fn (string $key) => filled(($credentials ?: [])[$key] ?? null))
            ->values()
            ->all();

        return [
            'live' => $filled($gateway->credentials),
            'test' => $filled($gateway->test_credentials),
        ];
    }
}
