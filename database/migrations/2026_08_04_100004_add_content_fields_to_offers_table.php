<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Richer copy for the homepage offers carousel so a card can carry a
     * subtitle, badge and its own call-to-action wording instead of just a
     * title baked into the artwork.
     */
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->string('subtitle')->nullable()->after('title');
            $table->text('description')->nullable()->after('subtitle');
            $table->string('badge_text', 40)->nullable()->after('description');
            $table->string('cta_label', 40)->nullable()->after('link_url');
            // gradient — dark scrim behind the text (default)
            // none     — artwork only, no overlay or text
            // solid    — solid panel under the text, for busy artwork
            $table->string('overlay_style', 20)->default('gradient')->after('cta_label');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['subtitle', 'description', 'badge_text', 'cta_label', 'overlay_style']);
        });
    }
};
