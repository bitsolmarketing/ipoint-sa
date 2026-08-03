<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bank credentials used for EFT / direct-deposit settlement.
     *
     * The account number is encrypted at rest and only ever surfaced to the
     * customer in masked form (see BankAccount::$maskedAccountNumber); the admin
     * screen is the one place the full value can be read back.
     */
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('label')->nullable();          // e.g. "Primary ZAR settlement"
            $table->string('account_holder');
            $table->string('bank_name');
            $table->text('account_number');               // encrypted
            $table->string('account_type', 40)->nullable(); // cheque | savings | business
            $table->string('branch_code', 20)->nullable();
            $table->string('swift_code', 20)->nullable();
            $table->string('currency', 3)->default('ZAR');
            $table->string('reference_prefix', 20)->nullable(); // prefix for customer payment references
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
