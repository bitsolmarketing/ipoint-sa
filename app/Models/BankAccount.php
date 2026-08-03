<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    protected $fillable = [
        'label',
        'account_holder',
        'bank_name',
        'account_number',
        'account_type',
        'branch_code',
        'swift_code',
        'currency',
        'reference_prefix',
        'is_primary',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'account_number' => 'encrypted',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Keep the real account number out of every automatic serialisation; the
     * admin screen asks for it explicitly, and the storefront uses the mask.
     */
    protected $hidden = [
        'account_number',
    ];

    protected $appends = [
        'masked_account_number',
    ];

    /**
     * "•••• •••• 4821" — safe to show on an order confirmation page.
     */
    public function getMaskedAccountNumberAttribute(): string
    {
        $number = (string) $this->account_number;

        if (strlen($number) <= 4) {
            return str_repeat('•', max(strlen($number), 4));
        }

        return str_repeat('•', strlen($number) - 4) . substr($number, -4);
    }

    /**
     * Only one account can be the primary settlement account.
     */
    public function makePrimary(): void
    {
        static::where('id', '!=', $this->id)->update(['is_primary' => false]);

        $this->update(['is_primary' => true]);
    }
}
