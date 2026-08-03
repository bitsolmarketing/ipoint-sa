<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the two fields the /services repair selector captures:
     *  - service_mode:   in-store appointment vs. home collection
     *  - device_variant: the storage / case size / configuration chosen
     */
    public function up(): void
    {
        Schema::table('repair_bookings', function (Blueprint $table) {
            $table->string('service_mode')->default('in_store')->after('repair_type'); // in_store | home_collection
            $table->string('device_variant')->nullable()->after('device_model');
        });
    }

    public function down(): void
    {
        Schema::table('repair_bookings', function (Blueprint $table) {
            $table->dropColumn(['service_mode', 'device_variant']);
        });
    }
};
