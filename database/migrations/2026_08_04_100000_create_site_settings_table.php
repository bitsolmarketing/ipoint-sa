<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Generic admin-editable key/value store, namespaced by `group`.
     *
     * Backs the appearance/theme palette, the offers section copy and the
     * repair-service options, so those can change without a deploy. Values are
     * JSON-encoded so a setting can hold a scalar or a structure.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group', 50)->index();  // theme | offers | repairs | payments
            $table->string('key', 100);
            $table->text('value')->nullable();     // JSON-encoded
            $table->timestamps();

            $table->unique(['group', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
