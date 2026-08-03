<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairPrice extends Model
{
    protected $fillable = [
        'repair_model_id',
        'repair_type_id',
        'price',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    public function model()
    {
        return $this->belongsTo(RepairModel::class, 'repair_model_id');
    }

    public function type()
    {
        return $this->belongsTo(RepairType::class, 'repair_type_id');
    }
}
