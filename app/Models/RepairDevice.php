<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairDevice extends Model
{
    protected $fillable = [
        'key',
        'label',
        'variant_label',
        'image_path',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function models()
    {
        return $this->hasMany(RepairModel::class)->orderBy('sort_order')->orderBy('id');
    }
}
