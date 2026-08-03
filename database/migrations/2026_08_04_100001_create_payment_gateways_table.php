<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Merchant onboarding records — one row per payment provider.
     *
     * `credentials` holds the provider-specific merchant/API fields as an
     * encrypted JSON blob (cast through Laravel's `encrypted:array`), so
     * merchant keys and passphrases are never readable straight off the table.
     * Separate live/test credential sets are kept side by side so switching
     * modes does not destroy the other set.
     */
    public function up(): void
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 40)->unique();  // payfast | yoco | ozow | peach | paygate | stripe | paypal | eft | cod
            $table->string('label');                   // shown to the customer at checkout
            $table->text('description')->nullable();   // customer-facing helper line
            $table->boolean('is_enabled')->default(false);
            $table->boolean('is_test_mode')->default(true);
            $table->text('credentials')->nullable();       // encrypted JSON — live
            $table->text('test_credentials')->nullable();  // encrypted JSON — sandbox
            $table->string('merchant_status', 20)->default('pending'); // pending | submitted | active | rejected
            $table->text('merchant_notes')->nullable();    // onboarding notes / reference numbers
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateways');
    }
};
