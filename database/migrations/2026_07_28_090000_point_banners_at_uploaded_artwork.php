<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The homepage banners were still seeded with Unsplash stock URLs while the real
 * artwork sat unused in uploads/. This repoints every rendered banner slot at the
 * uploaded files, fills the two promo slots (`spotlight` had no row at all, so
 * Promotional Banner #1 rendered nothing) and adds the footer strip.
 *
 * Slots are keyed by position + sort_order so re-running is idempotent, and the
 * artwork carries its own baked-in text — titles here are admin labels only.
 */
return new class extends Migration
{
    /** position => [sort_order => [title, subtitle, image_path, link_url]] */
    private const BANNERS = [
        'hero' => [
            1 => ['Special Offer For iPhones', 'Beyond Limit. Beyond Power.', '/uploads/banners/hero-iphone-offer.jpeg', '/category/iphone'],
            2 => ['Offer For AirPods', 'Sound beyond every beat.', '/uploads/banners/hero-airpods-offer.jpeg', '/category/airpods'],
            3 => ['Offer For Watch', 'Apple Watch. Big-Time Upgrade.', '/uploads/banners/hero-watch-offer.jpeg', '/category/watch'],
        ],
        'spotlight' => [
            1 => ['iPhone 17 Pro', 'The 17 Pro series is available now. Starting from R27 999.', '/uploads/banners/promo-iphone-17-pro.jpeg', '/category/iphone'],
        ],
        'zigzag' => [
            1 => ['Choose Genuine Apple', 'Only official Apple products for South Africa. Starting from R27 999.', '/uploads/banners/promo-genuine-apple.jpeg', '/products'],
        ],
        'footer' => [
            1 => ['iPad & Mac', 'Explore the full iPad and Mac range.', '/uploads/banners/footer-ipad-mac.jpeg', '/products'],
        ],
    ];

    public function up(): void
    {
        $now = now();

        foreach (self::BANNERS as $position => $slots) {
            foreach ($slots as $sortOrder => [$title, $subtitle, $imagePath, $linkUrl]) {
                $existing = DB::table('banners')
                    ->where('position', $position)
                    ->where('sort_order', $sortOrder)
                    ->first();

                $attributes = [
                    'title' => $title,
                    'subtitle' => $subtitle,
                    'image_path' => $imagePath,
                    'link_url' => $linkUrl,
                    'is_active' => true,
                    'updated_at' => $now,
                ];

                if ($existing) {
                    DB::table('banners')->where('id', $existing->id)->update($attributes);
                    continue;
                }

                DB::table('banners')->insert($attributes + [
                    'position' => $position,
                    'sort_order' => $sortOrder,
                    'created_at' => $now,
                ]);
            }

            // Stock leftovers beyond the artwork we have (e.g. the old zigzag
            // trade-in/iCare rows) would render as a stray strip — retire them.
            DB::table('banners')
                ->where('position', $position)
                ->whereNotIn('sort_order', array_keys($slots))
                ->update(['is_active' => false, 'updated_at' => $now]);
        }
    }

    public function down(): void
    {
        DB::table('banners')
            ->where('position', 'footer')
            ->delete();

        DB::table('banners')
            ->whereIn('position', ['hero', 'spotlight', 'zigzag'])
            ->where('image_path', 'like', '/uploads/banners/%')
            ->update(['is_active' => false]);
    }
};
