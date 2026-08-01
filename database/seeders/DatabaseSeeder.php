<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Color;
use App\Models\Size;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Banner;
use App\Models\Offer;
use App\Models\RepairLocation;
use App\Models\AttributeGroup;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Test Users
        User::create([
            'name' => 'iPoint Admin',
            'email' => 'admin@istore.co.za',
            'password' => Hash::make('Password123!'),
            'is_admin' => true,
        ]);

        User::create([
            'name' => 'iPoint Client',
            'email' => 'client@istore.co.za',
            'password' => Hash::make('Password123!'),
            'is_admin' => false,
        ]);

        // 2. Create Categories
        $categoriesData = [
            [
                'name' => 'Mac',
                'slug' => 'mac',
                'description' => 'Supercharged by Apple silicon. Powerhouse laptops and desktops.',
                'image_path' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 1
            ],
            [
                'name' => 'iPad',
                'slug' => 'ipad',
                'description' => 'Touch, draw, write. Computer power in a versatile tablet.',
                'image_path' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 2
            ],
            [
                'name' => 'iPhone',
                'slug' => 'iphone',
                'description' => 'Designed to be loved. High-end cameras, titanium builds, powerful chips.',
                'image_path' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 3
            ],
            [
                'name' => 'Watch',
                'slug' => 'watch',
                'description' => 'The ultimate device for a healthy life. Health tracking and notifications.',
                'image_path' => 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 4
            ],
            [
                'name' => 'AirPods',
                'slug' => 'airpods',
                'description' => 'Wireless. Effortless. Magical. Rich, high-quality audio.',
                'image_path' => 'https://images.unsplash.com/photo-1588449668338-d15176316704?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 5
            ],
            [
                'name' => 'TV & Home',
                'slug' => 'tv-home',
                'description' => 'Smart living. Experience cinema at home or smart automation.',
                'image_path' => 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 6
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Cases, chargers, peripherals, and more to customize your setup.',
                'image_path' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
                'nav_order' => 7
            ]
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::create($cat);
        }

        // 3. Create Colors
        $colorsData = [
            ['name' => 'Space Black', 'hex_code' => '#1d1d1f'],
            ['name' => 'Silver', 'hex_code' => '#e3e4e5'],
            ['name' => 'Deep Purple', 'hex_code' => '#3d2c42'],
            ['name' => 'Natural Titanium', 'hex_code' => '#a69f96'],
            ['name' => 'Starlight', 'hex_code' => '#f0ebe6'],
            ['name' => 'Midnight', 'hex_code' => '#2e3641'],
            ['name' => 'Blue', 'hex_code' => '#c9d1e6'],
            ['name' => 'Pink', 'hex_code' => '#fcdbe3'],
            ['name' => 'Space Gray', 'hex_code' => '#53565a'],
        ];

        $colors = [];
        foreach ($colorsData as $color) {
            $colors[$color['name']] = Color::create($color);
        }

        // 4. Create Sizes (capacities, dimensions, etc.)
        $sizesData = [
            // Storage tiers
            ['name' => '64GB', 'reference_value' => 'Storage capacity'],
            ['name' => '128GB', 'reference_value' => 'Storage capacity'],
            ['name' => '256GB', 'reference_value' => 'Storage capacity'],
            ['name' => '512GB', 'reference_value' => 'Storage capacity'],
            ['name' => '1TB', 'reference_value' => 'Storage capacity'],
            // Watch sizes
            ['name' => '40mm', 'reference_value' => 'Case size'],
            ['name' => '41mm', 'reference_value' => 'Case size'],
            ['name' => '44mm', 'reference_value' => 'Case size'],
            ['name' => '45mm', 'reference_value' => 'Case size'],
            ['name' => '49mm', 'reference_value' => 'Case size'],
            // Screen sizes
            ['name' => '11-inch', 'reference_value' => 'Screen size'],
            ['name' => '13-inch', 'reference_value' => 'Screen size'],
            ['name' => '14-inch', 'reference_value' => 'Screen size'],
            ['name' => '15-inch', 'reference_value' => 'Screen size'],
            ['name' => '16-inch', 'reference_value' => 'Screen size'],
        ];

        $sizes = [];
        foreach ($sizesData as $size) {
            $sizes[$size['name']] = Size::create($size);
        }

        // 5. Create Dynamic Banners
        $bannersData = [
            // Hero slideshow — 2:1 posters with the promo text baked into the artwork.
            [
                'title' => 'Special Offer For iPhones',
                'subtitle' => 'Beyond Limit. Beyond Power.',
                'image_path' => '/uploads/banners/hero-iphone-offer.jpeg',
                'link_url' => '/category/iphone',
                'position' => 'hero',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Offer For AirPods',
                'subtitle' => 'Sound beyond every beat.',
                'image_path' => '/uploads/banners/hero-airpods-offer.jpeg',
                'link_url' => '/category/airpods',
                'position' => 'hero',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Offer For Watch',
                'subtitle' => 'Apple Watch. Big-Time Upgrade.',
                'image_path' => '/uploads/banners/hero-watch-offer.jpeg',
                'link_url' => '/category/watch',
                'position' => 'hero',
                'sort_order' => 3,
                'is_active' => true,
            ],
            // Promotional Banner #1 — full-width strip below Latest Offers.
            [
                'title' => 'iPhone 17 Pro',
                'subtitle' => 'The 17 Pro series is available now. Starting from R27 999.',
                'image_path' => '/uploads/banners/promo-iphone-17-pro.jpeg',
                'link_url' => '/category/iphone',
                'position' => 'spotlight',
                'sort_order' => 1,
                'is_active' => true,
            ],
            // Promotional Banner #2 — full-width strip above the accessories shelf.
            [
                'title' => 'Choose Genuine Apple',
                'subtitle' => 'Only official Apple products for South Africa. Starting from R27 999.',
                'image_path' => '/uploads/banners/promo-genuine-apple.jpeg',
                'link_url' => '/products',
                'position' => 'zigzag',
                'sort_order' => 1,
                'is_active' => true,
            ],
            // Footer strip — rendered above the footer columns on every page.
            [
                'title' => 'iPad & Mac',
                'subtitle' => 'Explore the full iPad and Mac range.',
                'image_path' => '/uploads/banners/footer-ipad-mac.jpeg',
                'link_url' => '/products',
                'position' => 'footer',
                'sort_order' => 1,
                'is_active' => true,
            ],
        ];

        foreach ($bannersData as $banner) {
            Banner::create($banner);
        }

        // 5b. Latest Offers (admin-managed homepage carousel) — Redesign Guide §4.4
        $offersData = [
            [
                'title' => 'Trade-In Bonus',
                'image_path' => 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80',
                'link_url' => '/services',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Student Offer',
                'image_path' => 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=800&q=80',
                'link_url' => '/category/mac',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Accessory Bundle Savings',
                'image_path' => 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
                'link_url' => '/category/accessories',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Certified Pre-Owned Deals',
                'image_path' => 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
                'link_url' => '/category/iphone',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($offersData as $offer) {
            Offer::create($offer);
        }

        // 5c. Repair service locations (booking flow) — Redesign Guide §8.5
        $repairLocationsData = [
            ['name' => 'Sandton City', 'address' => 'Shop U60, Sandton City', 'city' => 'Johannesburg', 'slot_capacity' => 10],
            ['name' => 'V&A Waterfront', 'address' => 'Victoria Wharf, V&A Waterfront', 'city' => 'Cape Town', 'slot_capacity' => 8],
            ['name' => 'Gateway', 'address' => 'Gateway Theatre of Shopping', 'city' => 'Durban', 'slot_capacity' => 6],
            ['name' => 'Menlyn Park', 'address' => 'Menlyn Park Shopping Centre', 'city' => 'Pretoria', 'slot_capacity' => 6],
        ];

        foreach ($repairLocationsData as $loc) {
            RepairLocation::create($loc);
        }

        // 6. Create Products & Variants
        $productsData = [
            // iPhones
            [
                'category' => 'iphone',
                'name' => 'iPhone 15 Pro',
                'description' => 'The iPhone 15 Pro is the first iPhone to feature an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars. It features the powerful A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
                'base_price' => 20999.00,
                'original_price' => 22999.00,
                'is_on_promo' => true,
                'is_featured' => true,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Natural Titanium', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 15],
                    ['color' => 'Natural Titanium', 'size' => '256GB', 'price_modifier' => 3000.00, 'stock' => 10],
                    ['color' => 'Natural Titanium', 'size' => '512GB', 'price_modifier' => 7000.00, 'stock' => 5],
                    ['color' => 'Space Black', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 12],
                    ['color' => 'Space Black', 'size' => '256GB', 'price_modifier' => 3000.00, 'stock' => 8],
                ]
            ],
            [
                'category' => 'iphone',
                'name' => 'iPhone 15 Pro Max',
                'description' => 'The ultimate iPhone. Featuring a lightweight titanium design, A17 Pro chip, 5x Telephoto camera (the longest optical zoom ever in an iPhone), and outstanding battery life.',
                'base_price' => 24999.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => true,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Natural Titanium', 'size' => '256GB', 'price_modifier' => 0.00, 'stock' => 8],
                    ['color' => 'Natural Titanium', 'size' => '512GB', 'price_modifier' => 4000.00, 'stock' => 4],
                    ['color' => 'Natural Titanium', 'size' => '1TB', 'price_modifier' => 8000.00, 'stock' => 2],
                    ['color' => 'Blue', 'size' => '256GB', 'price_modifier' => 0.00, 'stock' => 6],
                ]
            ],
            [
                'category' => 'iphone',
                'name' => 'iPhone 15',
                'description' => 'Features Dynamic Island, a 48MP Main camera, and USB-C, all in a durable color-infused glass and aluminum design.',
                'base_price' => 15999.00,
                'original_price' => 16999.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Pink', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 20],
                    ['color' => 'Pink', 'size' => '256GB', 'price_modifier' => 2000.00, 'stock' => 15],
                    ['color' => 'Blue', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 18],
                ]
            ],
            // Gold Desire (used / refurbished) iPhones — Redesign Guide §6
            [
                'category' => 'iphone',
                'name' => 'iPhone 14 Pro (Gold Desire)',
                'description' => 'Certified pre-owned iPhone 14 Pro, professionally inspected and restored to full working condition. Includes a fresh battery calibration and a 90-day workmanship warranty.',
                'base_price' => 13999.00,
                'original_price' => 18999.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'listing_type' => 'gold_desire',
                'condition_grade' => 'A',
                'cosmetic_notes' => 'Grade A — minimal signs of use, no visible scratches on the display. Light micro-marks on the frame only.',
                'battery_health' => 92,
                'image_path' => 'https://images.unsplash.com/photo-1663499482516-c4d5b2c7e58a?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1663499482516-c4d5b2c7e58a?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Deep Purple', 'size' => '256GB', 'price_modifier' => 0.00, 'stock' => 3],
                    ['color' => 'Space Black', 'size' => '128GB', 'price_modifier' => -1000.00, 'stock' => 2],
                ]
            ],
            [
                'category' => 'iphone',
                'name' => 'iPhone 13 (Gold Desire)',
                'description' => 'Certified pre-owned iPhone 13 in excellent working order. Each unit passes a 45-point functional inspection before it is listed and ships with a 90-day workmanship warranty.',
                'base_price' => 8999.00,
                'original_price' => 12999.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'listing_type' => 'gold_desire',
                'condition_grade' => 'B',
                'cosmetic_notes' => 'Grade B — good condition with light scratches on the frame, screen glass intact and fully functional.',
                'battery_health' => 87,
                'image_path' => 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Midnight', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 4],
                    ['color' => 'Starlight', 'size' => '256GB', 'price_modifier' => 900.00, 'stock' => 2],
                ]
            ],
            // Macs
            [
                'category' => 'mac',
                'name' => 'MacBook Air 13-inch M3',
                'description' => 'The world’s most popular laptop is better than ever with the power of the M3 chip. With up to 18 hours of battery life, you can take the super-portable MacBook Air anywhere.',
                'base_price' => 19999.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => true,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Midnight', 'size' => '13-inch', 'price_modifier' => 0.00, 'stock' => 10],
                    ['color' => 'Starlight', 'size' => '13-inch', 'price_modifier' => 0.00, 'stock' => 8],
                    ['color' => 'Silver', 'size' => '13-inch', 'price_modifier' => 0.00, 'stock' => 5],
                ]
            ],
            [
                'category' => 'mac',
                'name' => 'MacBook Pro 14-inch M3',
                'description' => 'MacBook Pro blasts forward with M3, M3 Pro, and M3 Max chips. Built on a 3‑nanometer technology and featuring an all-new GPU architecture, they are the most advanced chips ever built for a personal computer.',
                'base_price' => 29999.00,
                'original_price' => 31999.00,
                'is_on_promo' => true,
                'is_featured' => true,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Gray', 'size' => '14-inch', 'price_modifier' => 0.00, 'stock' => 6],
                    ['color' => 'Silver', 'size' => '14-inch', 'price_modifier' => 0.00, 'stock' => 4],
                ]
            ],
            [
                'category' => 'mac',
                'name' => 'MacBook Pro 16-inch M3 Pro',
                'description' => 'The ultimate pro laptop. M3 Pro and M3 Max chips. Gorgeous Liquid Retina XDR screen. Epic battery life up to 22 hours.',
                'base_price' => 45999.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Gray', 'size' => '16-inch', 'price_modifier' => 0.00, 'stock' => 4],
                    ['color' => 'Silver', 'size' => '16-inch', 'price_modifier' => 0.00, 'stock' => 3],
                ]
            ],
            // iPads
            [
                'category' => 'ipad',
                'name' => 'iPad Pro 11-inch M4',
                'description' => 'Impossibly thin design. Breakthrough Ultra Retina XDR display with tandem OLED. Outrageous M4 chip performance.',
                'base_price' => 18999.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => true,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Black', 'size' => '256GB', 'price_modifier' => 0.00, 'stock' => 12],
                    ['color' => 'Space Black', 'size' => '512GB', 'price_modifier' => 3800.00, 'stock' => 8],
                    ['color' => 'Silver', 'size' => '256GB', 'price_modifier' => 0.00, 'stock' => 10],
                ]
            ],
            [
                'category' => 'ipad',
                'name' => 'iPad Air 11-inch M2',
                'description' => 'Light. Bright. Loaded. The super-portable 11-inch iPad Air is supercharged by the Apple M2 chip.',
                'base_price' => 11999.00,
                'original_price' => 12999.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Gray', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 15],
                    ['color' => 'Blue', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 12],
                    ['color' => 'Starlight', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 10],
                ]
            ],
            // Watches
            [
                'category' => 'watch',
                'name' => 'Apple Watch Series 9',
                'description' => 'Smarter. Brighter. Mightier. The most powerful chip in Apple Watch ever. A magical new way to use your watch without touching the screen.',
                'base_price' => 8999.00,
                'original_price' => 9499.00,
                'is_on_promo' => true,
                'is_featured' => true,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Midnight', 'size' => '41mm', 'price_modifier' => 0.00, 'stock' => 10],
                    ['color' => 'Midnight', 'size' => '45mm', 'price_modifier' => 800.00, 'stock' => 8],
                    ['color' => 'Starlight', 'size' => '41mm', 'price_modifier' => 0.00, 'stock' => 6],
                ]
            ],
            [
                'category' => 'watch',
                'name' => 'Apple Watch Ultra 2',
                'description' => 'The ultimate sports and adventure watch. Featuring a rugged titanium case, up to 36 hours of battery life, and a specialized band for athletes.',
                'base_price' => 17999.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => true,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Natural Titanium', 'size' => '49mm', 'price_modifier' => 0.00, 'stock' => 5],
                ]
            ],
            // AirPods
            [
                'category' => 'airpods',
                'name' => 'AirPods Pro (2nd Gen)',
                'description' => 'Reengineered sound. Up to 2x more Active Noise Cancellation. Adaptive Audio adjusts noise control dynamically.',
                'base_price' => 4999.00,
                'original_price' => 5499.00,
                'is_on_promo' => true,
                'is_featured' => true,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1588449668338-d15176316704?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1588449668338-d15176316704?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Silver', 'size' => null, 'price_modifier' => 0.00, 'stock' => 25],
                ]
            ],
            [
                'category' => 'airpods',
                'name' => 'AirPods Max',
                'description' => 'Over-ear headphones re-imagined. A perfect balance of exhilarating high-fidelity audio and the effortless magic of AirPods.',
                'base_price' => 10999.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Gray', 'size' => null, 'price_modifier' => 0.00, 'stock' => 8],
                    ['color' => 'Silver', 'size' => null, 'price_modifier' => 0.00, 'stock' => 5],
                    ['color' => 'Blue', 'size' => null, 'price_modifier' => 0.00, 'stock' => 4],
                ]
            ],
            // TV & Home
            [
                'category' => 'tv-home',
                'name' => 'Apple TV 4K (128GB)',
                'description' => 'The Apple TV 4K (Wi‑Fi + Ethernet) comes loaded with 128GB of storage and Gigabit Ethernet for high-speed networking.',
                'base_price' => 3299.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Gray', 'size' => '128GB', 'price_modifier' => 0.00, 'stock' => 15],
                ]
            ],
            [
                'category' => 'tv-home',
                'name' => 'AirTag (4 Pack)',
                'description' => 'Keep track of your keys, wallet, luggage, backpack, and more, all in the Find My app.',
                'base_price' => 1899.00,
                'original_price' => 2099.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Silver', 'size' => null, 'price_modifier' => 0.00, 'stock' => 40],
                ]
            ],
            // Accessories
            [
                'category' => 'accessories',
                'name' => 'Apple Magic Mouse',
                'description' => 'Magic Mouse is wireless and rechargeable, with an optimized foot design that lets it glide smoothly across your desk.',
                'base_price' => 1699.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 30],
                    ['color' => 'Space Black', 'size' => null, 'price_modifier' => 300.00, 'stock' => 15],
                ],
                'attributes' => ['brand' => 'apple', 'sub-category' => 'peripherals', 'works-with' => ['mac', 'ipad'], 'features' => ['wireless', 'rechargeable'], 'connection-type' => 'bluetooth'],
            ],
            [
                'category' => 'accessories',
                'name' => 'Apple Magic Keyboard with Touch ID',
                'description' => 'Magic Keyboard is now available with Touch ID, providing fast, easy, and secure authentication for logins and purchases.',
                'base_price' => 3499.00,
                'original_price' => 3799.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 20],
                ],
                'attributes' => ['brand' => 'apple', 'sub-category' => 'peripherals', 'works-with' => ['mac'], 'features' => ['wireless', 'rechargeable', 'touch-id'], 'connection-type' => 'bluetooth'],
            ],
            [
                'category' => 'accessories',
                'name' => 'USB-C to Lightning Cable (1m)',
                'description' => 'Connect your iPhone, iPad, or iPod with Lightning connector to your USB-C or Thunderbolt 3 enabled Mac for syncing and charging.',
                'base_price' => 499.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 100],
                ],
                'attributes' => ['brand' => 'apple', 'sub-category' => 'cables-adapters', 'works-with' => ['iphone', 'ipad'], 'features' => ['fast-charging'], 'connection-type' => ['usb-c', 'lightning']],
            ],
            [
                'category' => 'accessories',
                'name' => 'Belkin BoostCharge Pro 3-in-1 Wireless Charger',
                'description' => 'Charge your iPhone, Apple Watch, and AirPods simultaneously with this premium 3-in-1 MagSafe compatible wireless charging pad.',
                'base_price' => 2799.00,
                'original_price' => 3199.00,
                'is_on_promo' => true,
                'is_featured' => true,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 15],
                    ['color' => 'Space Black', 'size' => null, 'price_modifier' => 0.00, 'stock' => 10],
                ],
                'attributes' => ['brand' => 'belkin', 'sub-category' => 'power-charging', 'works-with' => ['iphone', 'apple-watch', 'airpods'], 'features' => ['wireless', 'magsafe', 'fast-charging'], 'connection-type' => 'wireless'],
            ],
            [
                'category' => 'accessories',
                'name' => 'Apple iPhone 15 Silicone Case with MagSafe',
                'description' => 'Designed by Apple to complement the iPhone 15, the Silicone Case with MagSafe is a delightful way to protect your iPhone.',
                'base_price' => 899.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Midnight', 'size' => null, 'price_modifier' => 0.00, 'stock' => 25],
                    ['color' => 'Starlight', 'size' => null, 'price_modifier' => 0.00, 'stock' => 20],
                    ['color' => 'Blue', 'size' => null, 'price_modifier' => 0.00, 'stock' => 18],
                    ['color' => 'Pink', 'size' => null, 'price_modifier' => 0.00, 'stock' => 22],
                ],
                'attributes' => ['brand' => 'apple', 'sub-category' => 'cases', 'works-with' => ['iphone'], 'features' => ['magsafe'], 'connection-type' => 'wireless'],
            ],
            [
                'category' => 'accessories',
                'name' => 'Soundcore AeroFit 2 AI Translation Earbuds',
                'description' => 'Open-ear earbuds with AI-powered real-time translation in 40+ languages, delivering premium sound quality in a lightweight design.',
                'base_price' => 1999.00,
                'original_price' => 2199.00,
                'is_on_promo' => true,
                'is_featured' => true,
                'is_new' => true,
                'image_path' => 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 12],
                ],
                'attributes' => ['brand' => 'soundcore', 'sub-category' => 'audio', 'works-with' => ['iphone', 'ipad', 'mac'], 'features' => ['wireless', 'noise-cancellation'], 'connection-type' => 'bluetooth'],
            ],
            [
                'category' => 'accessories',
                'name' => 'Soundcore Motion 100 Portable Speaker',
                'description' => 'Portable waterproof Bluetooth speaker with deep bass, 12-hour battery, and IPX7 waterproof rating for outdoor adventures.',
                'base_price' => 1499.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'Space Black', 'size' => null, 'price_modifier' => 0.00, 'stock' => 20],
                ],
                'attributes' => ['brand' => 'soundcore', 'sub-category' => 'audio', 'works-with' => ['iphone', 'ipad', 'mac'], 'features' => ['wireless', 'waterproof'], 'connection-type' => 'bluetooth'],
            ],
            [
                'category' => 'accessories',
                'name' => 'Apple Pencil (2nd Generation)',
                'description' => 'Apple Pencil sets the standard for how drawing, note-taking, and marking up documents should feel — intuitive, precise, and magical.',
                'base_price' => 2499.00,
                'original_price' => null,
                'is_on_promo' => false,
                'is_featured' => true,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 30],
                ],
                'attributes' => ['brand' => 'apple', 'sub-category' => 'peripherals', 'works-with' => ['ipad'], 'features' => ['wireless', 'rechargeable', 'magsafe'], 'connection-type' => 'bluetooth'],
            ],
            [
                'category' => 'accessories',
                'name' => 'Apple Magic Trackpad',
                'description' => 'Magic Trackpad features a large edge-to-edge glass surface, Force Touch technology, and a built-in rechargeable battery.',
                'base_price' => 2299.00,
                'original_price' => 2499.00,
                'is_on_promo' => true,
                'is_featured' => false,
                'is_new' => false,
                'image_path' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'
                ],
                'variants' => [
                    ['color' => 'White', 'size' => null, 'price_modifier' => 0.00, 'stock' => 15],
                    ['color' => 'Space Black', 'size' => null, 'price_modifier' => 200.00, 'stock' => 10],
                ],
                'attributes' => ['brand' => 'apple', 'sub-category' => 'peripherals', 'works-with' => ['mac'], 'features' => ['wireless', 'rechargeable', 'force-touch'], 'connection-type' => 'bluetooth'],
            ],
        ];

        // Track created products by name for attribute assignment
        $createdProducts = [];

        foreach ($productsData as $prodData) {
            $catSlug = $prodData['category'];
            $catId = isset($categories[$catSlug]) ? $categories[$catSlug]->id : null;

            $prod = Product::create([
                'category_id' => $catId,
                'listing_type' => $prodData['listing_type'] ?? 'box_pack',
                'condition_grade' => $prodData['condition_grade'] ?? null,
                'cosmetic_notes' => $prodData['cosmetic_notes'] ?? null,
                'battery_health' => $prodData['battery_health'] ?? null,
                'name' => $prodData['name'],
                'slug' => Str::slug($prodData['name']),
                'description' => $prodData['description'],
                'base_price' => $prodData['base_price'],
                'original_price' => $prodData['original_price'],
                'image_path' => $prodData['image_path'],
                'gallery_images' => $prodData['gallery_images'],
                'is_featured' => $prodData['is_featured'],
                'is_new' => $prodData['is_new'],
                'is_on_promo' => $prodData['is_on_promo'],
            ]);

            // Track product for attribute assignment
            $createdProducts[$prodData['name']] = [
                'product' => $prod,
                'attributes' => $prodData['attributes'] ?? [],
            ];

            foreach ($prodData['variants'] as $varData) {
                $colorId = null;
                if ($varData['color'] && isset($colors[$varData['color']])) {
                    $colorId = $colors[$varData['color']]->id;
                } else if ($varData['color']) {
                    // Create if not found
                    $newColor = Color::firstOrCreate(['name' => $varData['color']], ['hex_code' => '#cccccc']);
                    $colorId = $newColor->id;
                    $colors[$varData['color']] = $newColor;
                }

                $sizeId = null;
                if ($varData['size'] && isset($sizes[$varData['size']])) {
                    $sizeId = $sizes[$varData['size']]->id;
                }

                $colorCode = $varData['color'] ? strtoupper(substr(str_replace(' ', '', $varData['color']), 0, 3)) : 'XX';
                $sizeCode = $varData['size'] ? strtoupper(str_replace('-', '', $varData['size'])) : 'FS';
                $sku = strtoupper(substr($catSlug, 0, 3)) . '-' . $prod->id . '-' . $colorCode . '-' . $sizeCode;

                ProductVariant::create([
                    'product_id' => $prod->id,
                    'color_id' => $colorId,
                    'size_id' => $sizeId,
                    'sku' => $sku,
                    'price_modifier' => $varData['price_modifier'],
                    'stock' => $varData['stock']
                ]);
            }
        }

        // 7. Create Attribute Groups & Values
        $attributeGroupsData = [
            [
                'name' => 'Brand',
                'slug' => 'brand',
                'sort_order' => 1,
                'values' => [
                    ['value' => 'Apple', 'slug' => 'apple', 'sort_order' => 1],
                    ['value' => 'Soundcore', 'slug' => 'soundcore', 'sort_order' => 2],
                    ['value' => 'Belkin', 'slug' => 'belkin', 'sort_order' => 3],
                    ['value' => 'Samsung', 'slug' => 'samsung', 'sort_order' => 4],
                ],
            ],
            [
                'name' => 'Category',
                'slug' => 'sub-category',
                'sort_order' => 2,
                'values' => [
                    ['value' => 'Cases', 'slug' => 'cases', 'sort_order' => 1],
                    ['value' => 'Cables & Adapters', 'slug' => 'cables-adapters', 'sort_order' => 2],
                    ['value' => 'Audio', 'slug' => 'audio', 'sort_order' => 3],
                    ['value' => 'Power & Charging', 'slug' => 'power-charging', 'sort_order' => 4],
                    ['value' => 'Peripherals', 'slug' => 'peripherals', 'sort_order' => 5],
                ],
            ],
            [
                'name' => 'Works with',
                'slug' => 'works-with',
                'sort_order' => 3,
                'values' => [
                    ['value' => 'iPhone', 'slug' => 'iphone', 'sort_order' => 1],
                    ['value' => 'iPad', 'slug' => 'ipad', 'sort_order' => 2],
                    ['value' => 'Mac', 'slug' => 'mac', 'sort_order' => 3],
                    ['value' => 'Apple Watch', 'slug' => 'apple-watch', 'sort_order' => 4],
                    ['value' => 'AirPods', 'slug' => 'airpods', 'sort_order' => 5],
                ],
            ],
            [
                'name' => 'Features',
                'slug' => 'features',
                'sort_order' => 4,
                'values' => [
                    ['value' => 'Wireless', 'slug' => 'wireless', 'sort_order' => 1],
                    ['value' => 'Noise Cancellation', 'slug' => 'noise-cancellation', 'sort_order' => 2],
                    ['value' => 'MagSafe', 'slug' => 'magsafe', 'sort_order' => 3],
                    ['value' => 'Fast Charging', 'slug' => 'fast-charging', 'sort_order' => 4],
                    ['value' => 'Rechargeable', 'slug' => 'rechargeable', 'sort_order' => 5],
                    ['value' => 'Touch ID', 'slug' => 'touch-id', 'sort_order' => 6],
                    ['value' => 'Waterproof', 'slug' => 'waterproof', 'sort_order' => 7],
                    ['value' => 'Force Touch', 'slug' => 'force-touch', 'sort_order' => 8],
                ],
            ],
            [
                'name' => 'Connection type',
                'slug' => 'connection-type',
                'sort_order' => 5,
                'values' => [
                    ['value' => 'USB-C', 'slug' => 'usb-c', 'sort_order' => 1],
                    ['value' => 'Lightning', 'slug' => 'lightning', 'sort_order' => 2],
                    ['value' => 'Bluetooth', 'slug' => 'bluetooth', 'sort_order' => 3],
                    ['value' => 'Wireless', 'slug' => 'wireless', 'sort_order' => 4],
                    ['value' => 'Wi-Fi', 'slug' => 'wifi', 'sort_order' => 5],
                ],
            ],
        ];

        // Build a lookup of attribute value models by group slug => value slug
        $attrValueLookup = [];

        foreach ($attributeGroupsData as $groupData) {
            $group = AttributeGroup::create([
                'name' => $groupData['name'],
                'slug' => $groupData['slug'],
                'sort_order' => $groupData['sort_order'],
                'is_active' => true,
            ]);

            foreach ($groupData['values'] as $valData) {
                $val = AttributeValue::create([
                    'attribute_group_id' => $group->id,
                    'value' => $valData['value'],
                    'slug' => $valData['slug'],
                    'sort_order' => $valData['sort_order'],
                ]);
                $attrValueLookup[$groupData['slug']][$valData['slug']] = $val->id;
            }
        }

        // 8. Assign attributes to accessories products
        foreach ($createdProducts as $prodName => $data) {
            if (empty($data['attributes'])) {
                continue;
            }

            $valueIds = [];
            foreach ($data['attributes'] as $groupSlug => $valueSlugs) {
                // Normalize to array
                $slugs = is_array($valueSlugs) ? $valueSlugs : [$valueSlugs];
                foreach ($slugs as $slug) {
                    if (isset($attrValueLookup[$groupSlug][$slug])) {
                        $valueIds[] = $attrValueLookup[$groupSlug][$slug];
                    }
                }
            }

            if (!empty($valueIds)) {
                $data['product']->attributeValues()->sync($valueIds);
            }
        }
    }
}
