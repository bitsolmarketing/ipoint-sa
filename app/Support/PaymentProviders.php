<?php

namespace App\Support;

/**
 * Registry of supported payment providers and the merchant-onboarding fields
 * each one needs.
 *
 * This is the single source of truth for the admin form: adding a provider or a
 * credential field here makes it appear in Admin → Payments with no JSX change,
 * and the controller validates against it so no unexpected key can be stored.
 *
 * Field types:
 *   text   — shown in full
 *   secret — write-only in the UI; the stored value is never sent to the browser,
 *            only a "set / not set" flag (see AdminPaymentController::maskedFor)
 */
class PaymentProviders
{
    public const PROVIDERS = [
        'payfast' => [
            'label' => 'PayFast',
            'blurb' => 'South Africa\'s most widely used gateway — cards, Instant EFT, Mobicred, SnapScan.',
            'onboarding_url' => 'https://www.payfast.co.za/registration',
            'settlement' => 'Settles into your linked bank account, typically in 2 business days.',
            'fields' => [
                ['key' => 'merchant_id',  'label' => 'Merchant ID',  'type' => 'text',   'required' => true,  'hint' => 'Found under Settings in your PayFast dashboard.'],
                ['key' => 'merchant_key', 'label' => 'Merchant Key', 'type' => 'secret', 'required' => true,  'hint' => 'Settings → Integration.'],
                ['key' => 'passphrase',   'label' => 'Passphrase',   'type' => 'secret', 'required' => false, 'hint' => 'Optional, but required for signature validation on ITN callbacks.'],
            ],
        ],

        'yoco' => [
            'label' => 'Yoco',
            'blurb' => 'Card payments with same-day settlement and no monthly fee.',
            'onboarding_url' => 'https://www.yoco.com/za/online-payments/',
            'settlement' => 'Next business day into your linked account.',
            'fields' => [
                ['key' => 'public_key', 'label' => 'Public Key', 'type' => 'text',   'required' => true, 'hint' => 'Starts with pk_live_ or pk_test_.'],
                ['key' => 'secret_key', 'label' => 'Secret Key', 'type' => 'secret', 'required' => true, 'hint' => 'Starts with sk_live_ or sk_test_. Never share this.'],
            ],
        ],

        'ozow' => [
            'label' => 'Ozow',
            'blurb' => 'Instant EFT — the customer pays straight from their online banking.',
            'onboarding_url' => 'https://ozow.com/get-started',
            'settlement' => 'Real-time confirmation, settled per your Ozow agreement.',
            'fields' => [
                ['key' => 'site_code',   'label' => 'Site Code',   'type' => 'text',   'required' => true, 'hint' => 'Issued per store in the Ozow merchant portal.'],
                ['key' => 'private_key', 'label' => 'Private Key', 'type' => 'secret', 'required' => true, 'hint' => 'Used to sign the request hash.'],
                ['key' => 'api_key',     'label' => 'API Key',     'type' => 'secret', 'required' => true, 'hint' => 'Required for payment status lookups.'],
            ],
        ],

        'peach' => [
            'label' => 'Peach Payments',
            'blurb' => 'Cards, EFT and buy-now-pay-later through a single integration.',
            'onboarding_url' => 'https://www.peachpayments.com/',
            'settlement' => 'Per your Peach merchant agreement.',
            'fields' => [
                ['key' => 'entity_id',    'label' => 'Entity ID',    'type' => 'text',   'required' => true, 'hint' => 'The channel/entity the transaction is booked against.'],
                ['key' => 'access_token', 'label' => 'Access Token', 'type' => 'secret', 'required' => true, 'hint' => 'Bearer token from the Peach dashboard.'],
            ],
        ],

        'paygate' => [
            'label' => 'PayGate',
            'blurb' => 'Established card acquiring, often paired with an existing merchant account.',
            'onboarding_url' => 'https://www.paygate.co.za/',
            'settlement' => 'Through your acquiring bank.',
            'fields' => [
                ['key' => 'paygate_id',     'label' => 'PayGate ID',     'type' => 'text',   'required' => true, 'hint' => 'Your 10-digit PayGate identifier.'],
                ['key' => 'encryption_key', 'label' => 'Encryption Key', 'type' => 'secret', 'required' => true, 'hint' => 'Used to checksum every request.'],
            ],
        ],

        'stripe' => [
            'label' => 'Stripe',
            'blurb' => 'International card payments and wallets.',
            'onboarding_url' => 'https://dashboard.stripe.com/register',
            'settlement' => 'Rolling payout schedule set in your Stripe dashboard.',
            'fields' => [
                ['key' => 'publishable_key', 'label' => 'Publishable Key', 'type' => 'text',   'required' => true,  'hint' => 'Starts with pk_.'],
                ['key' => 'secret_key',      'label' => 'Secret Key',      'type' => 'secret', 'required' => true,  'hint' => 'Starts with sk_.'],
                ['key' => 'webhook_secret',  'label' => 'Webhook Secret',  'type' => 'secret', 'required' => false, 'hint' => 'Starts with whsec_. Needed to verify webhook callbacks.'],
            ],
        ],

        'paypal' => [
            'label' => 'PayPal',
            'blurb' => 'Wallet and card payments for international buyers.',
            'onboarding_url' => 'https://www.paypal.com/za/business',
            'settlement' => 'Into your PayPal balance, then withdrawn to your bank.',
            'fields' => [
                ['key' => 'client_id',     'label' => 'Client ID',     'type' => 'text',   'required' => true, 'hint' => 'From your REST API app credentials.'],
                ['key' => 'client_secret', 'label' => 'Client Secret', 'type' => 'secret', 'required' => true, 'hint' => 'From the same REST API app.'],
            ],
        ],

        'eft' => [
            'label' => 'Bank transfer (EFT)',
            'blurb' => 'Manual EFT — the customer is shown your bank details and a payment reference.',
            'onboarding_url' => null,
            'settlement' => 'Straight into the bank account configured below.',
            'fields' => [],
        ],

        'cod' => [
            'label' => 'Cash / card on delivery',
            'blurb' => 'Payment is collected when the order is handed over.',
            'onboarding_url' => null,
            'settlement' => 'Collected by the driver or in store.',
            'fields' => [],
        ],
    ];

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_keys(self::PROVIDERS);
    }

    /**
     * Field definitions for one provider.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function fields(string $provider): array
    {
        return self::PROVIDERS[$provider]['fields'] ?? [];
    }

    /**
     * Just the credential keys a provider accepts — used to reject anything else.
     *
     * @return array<int, string>
     */
    public static function fieldKeys(string $provider): array
    {
        return array_column(self::fields($provider), 'key');
    }

    /**
     * Credential keys that must never be echoed back to the browser.
     *
     * @return array<int, string>
     */
    public static function secretKeys(string $provider): array
    {
        return array_column(
            array_filter(self::fields($provider), fn (array $field) => $field['type'] === 'secret'),
            'key'
        );
    }
}
