<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Moves the repair catalogue out of App\Support\RepairCatalogue's constants
     * and into admin-editable tables, so repair types, devices, models and
     * prices can be added or repriced without a deploy.
     *
     * Shape: device (iPhone) → model (iPhone 15 Pro) → price per repair type.
     * RepairCatalogue still falls back to its hard-coded constants while these
     * tables are empty, so the storefront never renders a blank selector.
     */
    public function up(): void
    {
        // What can be repaired — screen, battery, and anything the admin adds.
        Schema::create('repair_types', function (Blueprint $table) {
            $table->id();
            // Persisted on repair_bookings.repair_type, so never rename in place.
            $table->string('key', 50)->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->boolean('is_same_day')->default(false); // same-day turnaround at participating stores
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Product families — iPhone, iPad, Mac, Apple Watch.
        Schema::create('repair_devices', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();
            $table->string('label');
            $table->string('variant_label')->default('Storage'); // "Storage" / "Case size" / "Configuration"
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Individual models, with their selectable variants.
        Schema::create('repair_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_device_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->json('variants')->nullable(); // ["128GB", "256GB"]
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Price for one repair type on one model. A missing row means that
        // repair is not offered for that model.
        Schema::create('repair_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_model_id')->constrained()->cascadeOnDelete();
            $table->foreignId('repair_type_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(['repair_model_id', 'repair_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repair_prices');
        Schema::dropIfExists('repair_models');
        Schema::dropIfExists('repair_devices');
        Schema::dropIfExists('repair_types');
    }
};
