<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairBooking extends Model
{
    protected $fillable = [
        'reference',
        'repair_type',
        'service_mode',
        'device_model',
        'device_variant',
        'repair_location_id',
        'booking_date',
        'time_slot',
        'customer_name',
        'email',
        'phone',
        'notes',
        'status',
        'technician',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
        ];
    }

    public function location()
    {
        return $this->belongsTo(RepairLocation::class, 'repair_location_id');
    }
}
