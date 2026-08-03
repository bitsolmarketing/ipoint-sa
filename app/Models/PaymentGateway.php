<?php

namespace App\Models;

use App\Support\PaymentProviders;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    protected $fillable = [
        'provider',
        'label',
        'description',
        'is_enabled',
        'is_test_mode',
        'credentials',
        'test_credentials',
        'merchant_status',
        'merchant_notes',
        'sort_order',
    ];

    /**
     * `encrypted:array` keeps merchant keys and passphrases unreadable at rest —
     * anyone with a database dump still cannot charge through the account.
     */
    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'is_test_mode' => 'boolean',
            'sort_order' => 'integer',
            'credentials' => 'encrypted:array',
            'test_credentials' => 'encrypted:array',
        ];
    }

    /**
     * Hide the credential blobs from every array/JSON conversion so they cannot
     * be leaked by accident through an Inertia prop or an API response.
     */
    protected $hidden = [
        'credentials',
        'test_credentials',
    ];

    /**
     * Gateways offered to customers at checkout.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_enabled', true)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * The credential set matching the current mode.
     *
     * @return array<string, mixed>
     */
    public function activeCredentials(): array
    {
        return ($this->is_test_mode ? $this->test_credentials : $this->credentials) ?: [];
    }

    /**
     * Whether every required field for the current mode has a value — what the
     * admin list shows as "Ready" vs "Incomplete".
     */
    public function isConfigured(): bool
    {
        $credentials = $this->activeCredentials();

        foreach (PaymentProviders::fields($this->provider) as $field) {
            if (($field['required'] ?? false) && blank($credentials[$field['key']] ?? null)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Static metadata for this gateway's provider.
     *
     * @return array<string, mixed>
     */
    public function providerMeta(): array
    {
        return PaymentProviders::PROVIDERS[$this->provider] ?? [
            'label' => $this->provider,
            'blurb' => '',
            'onboarding_url' => null,
            'settlement' => '',
            'fields' => [],
        ];
    }
}
