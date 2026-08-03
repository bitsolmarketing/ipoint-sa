<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairModel extends Model
{
    protected $fillable = [
        'repair_device_id',
        'name',
        'variants',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function device()
    {
        return $this->belongsTo(RepairDevice::class, 'repair_device_id');
    }

    public function prices()
    {
        return $this->hasMany(RepairPrice::class);
    }
}
