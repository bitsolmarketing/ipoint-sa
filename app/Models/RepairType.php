<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairType extends Model
{
    protected $fillable = [
        'key',
        'label',
        'description',
        'is_same_day',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_same_day' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function prices()
    {
        return $this->hasMany(RepairPrice::class);
    }
}
