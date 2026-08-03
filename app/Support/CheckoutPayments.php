<?php

namespace App\Support;

use App\Models\BankAccount;
use App\Models\PaymentGateway;

/**
 * Turns the admin's payment configuration into the list of methods the
 * storefront checkout renders.
 *
 * Each method carries a `flow`, which is what the checkout form keys off:
 *   inline_card — collect card details on our page (the original built-in flow)
 *   redirect    — the customer is handed to the provider's hosted page
 *   offline     — nothing to collect now (EFT, cash on delivery)
 */
class CheckoutPayments
{
    /**
     * Fallback offered when no gateway has been configured yet, so a fresh
     * install (or one whose migrations have not run) still checks out exactly
     * as it did before this screen existed.
     */
    private const LEGACY_METHODS = [
        [
            'provider' => 'cod',
            'label' => 'Cash on Delivery',
            'description' => 'Pay with cash upon package receipt.',
            'flow' => 'offline',
            'is_test_mode' => false,
        ],
        [
            'provider' => 'card',
            'label' => 'Payment by Card',
            'description' => 'Debit, Cheque, or Credit Card.',
            'flow' => 'inline_card',
            'is_test_mode' => false,
        ],
    ];

    /**
     * Methods to offer the customer.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function methods(): array
    {
        $gateways = rescue(fn () => PaymentGateway::available()->get(), collect(), false);

        // An enabled gateway missing a required credential is dropped rather
        // than shown — better no option than one that fails at the last step.
        $methods = $gateways
            ->filter(fn (PaymentGateway $gateway) => $gateway->isConfigured())
            ->map(fn (PaymentGateway $gateway) => [
                'provider' => $gateway->provider,
                'label' => $gateway->label,
                'description' => $gateway->description ?: ($gateway->providerMeta()['blurb'] ?? ''),
                'flow' => self::flowFor($gateway->provider),
                'is_test_mode' => (bool) $gateway->is_test_mode,
            ])
            ->values()
            ->all();

        return $methods ?: self::LEGACY_METHODS;
    }

    /**
     * Provider keys the checkout will accept, for request validation.
     *
     * @return array<int, string>
     */
    public static function allowedProviders(): array
    {
        return array_column(self::methods(), 'provider');
    }

    /**
     * The flow for one provider key, or null if it is not on offer.
     */
    public static function flowForProvider(string $provider): ?string
    {
        foreach (self::methods() as $method) {
            if ($method['provider'] === $provider) {
                return $method['flow'];
            }
        }

        return null;
    }

    /**
     * Bank details shown to EFT customers — masked, never the full number.
     *
     * @return array<string, mixed>|null
     */
    public static function primaryBankAccount(): ?array
    {
        $account = rescue(
            fn () => BankAccount::where('is_active', true)
                ->orderByDesc('is_primary')
                ->first(),
            null,
            false
        );

        if (! $account) {
            return null;
        }

        return [
            'account_holder' => $account->account_holder,
            'bank_name' => $account->bank_name,
            'masked_account_number' => $account->masked_account_number,
            'account_type' => $account->account_type,
            'branch_code' => $account->branch_code,
            'swift_code' => $account->swift_code,
            'currency' => $account->currency,
            'reference_prefix' => $account->reference_prefix,
        ];
    }

    /**
     * Admin-authored copy for the payment step.
     *
     * @return array<string, mixed>
     */
    public static function checkoutSettings(): array
    {
        return Settings::group('payments', [
            'instructions' => '',
            'show_bank_details_on_success' => true,
        ]);
    }

    private static function flowFor(string $provider): string
    {
        return match ($provider) {
            'cod', 'eft' => 'offline',
            'card' => 'inline_card',
            default => 'redirect',
        };
    }
}
