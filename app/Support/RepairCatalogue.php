<?php

namespace App\Support;

use App\Models\RepairDevice;
use App\Models\RepairType;

/**
 * Repair catalogue backing the /services repair selector (Product → Model →
 * Storage → Repair type → indicative price) and the /apple-product-repair
 * booking page.
 *
 * The catalogue is admin-managed (Admin → Repairs → Catalogue): device
 * families, models, repair types, prices and service options all live in the
 * database. The constants below are the seed data and the fallback used while
 * those tables are empty or have not been migrated yet, so the storefront never
 * renders an empty selector on a fresh install.
 *
 * Structured after istore.co.za/apple-product-repair. Deliberately avoids
 * "Apple Certified" / "Apple Authorised" wording — see the compliance note on
 * RepairController. Keep it that way unless iPoint is registered as an Apple
 * Authorised Service Provider.
 *
 * PRICES IN THE FALLBACK ARE INDICATIVE PLACEHOLDERS in ZAR. The page renders
 * them with a "subject to assessment" disclaimer.
 */
class RepairCatalogue
{
    /**
     * Default levy applied to devices that fail the eligibility inspection, in
     * ZAR. Overridden by the `repairs.ineligible_levy` setting.
     */
    public const INELIGIBLE_LEVY = 750;

    /**
     * Fallback repair type key => customer-facing label. Keys are persisted on
     * repair_bookings.repair_type, so never rename an existing key.
     */
    public const REPAIR_TYPES = [
        'screen'         => 'Screen / display replacement',
        'battery'        => 'Battery replacement',
        'rear_housing'   => 'Rear housing / back glass',
        'camera'         => 'Camera module',
        'charging_port'  => 'Charging port',
        'keyboard'       => 'Keyboard',
    ];

    /**
     * Fallback set of repair types eligible for same-day turnaround.
     */
    public const SAME_DAY_TYPES = ['screen', 'battery'];

    /**
     * Defaults for the admin-editable service options (`repairs` setting group).
     */
    public const SERVICE_DEFAULTS = [
        'ineligible_levy' => self::INELIGIBLE_LEVY,
        'time_slots' => ['09:00 – 11:00', '11:00 – 13:00', '13:00 – 15:00', '15:00 – 17:00'],
        'offer_in_store' => true,
        'offer_home_collection' => true,
        'home_collection_fee' => 0,
        'turnaround_note' => 'Most screen and battery repairs are completed the same day at participating stores.',
        'disclaimer' => 'Prices are indicative and subject to an in-store assessment of your device.',
        'booking_enabled' => true,
    ];

    /**
     * Seed/fallback catalogue. Imported into the database by
     * RepairCatalogueSeeder, after which the tables are authoritative.
     */
    public const FALLBACK_PRODUCTS = [
        [
            'key' => 'iphone',
            'label' => 'iPhone',
            'variant_label' => 'Storage',
            'image' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
            'models' => [
                [
                    'name' => 'iPhone 15 Pro Max',
                    'variants' => ['256GB', '512GB', '1TB'],
                    'repairs' => ['screen' => 11499, 'battery' => 2299, 'rear_housing' => 8999, 'camera' => 7499, 'charging_port' => 2799],
                ],
                [
                    'name' => 'iPhone 15 Pro',
                    'variants' => ['128GB', '256GB', '512GB', '1TB'],
                    'repairs' => ['screen' => 10499, 'battery' => 2299, 'rear_housing' => 7999, 'camera' => 6999, 'charging_port' => 2799],
                ],
                [
                    'name' => 'iPhone 15',
                    'variants' => ['128GB', '256GB', '512GB'],
                    'repairs' => ['screen' => 7999, 'battery' => 1999, 'rear_housing' => 5999, 'camera' => 4999, 'charging_port' => 2399],
                ],
                [
                    'name' => 'iPhone 14 Pro',
                    'variants' => ['128GB', '256GB', '512GB', '1TB'],
                    'repairs' => ['screen' => 9499, 'battery' => 2099, 'rear_housing' => 7499, 'camera' => 6499, 'charging_port' => 2599],
                ],
                [
                    'name' => 'iPhone 14',
                    'variants' => ['128GB', '256GB', '512GB'],
                    'repairs' => ['screen' => 7499, 'battery' => 1999, 'rear_housing' => 5499, 'camera' => 4599, 'charging_port' => 2299],
                ],
                [
                    'name' => 'iPhone 13',
                    'variants' => ['128GB', '256GB', '512GB'],
                    'repairs' => ['screen' => 6499, 'battery' => 1899, 'rear_housing' => 4999, 'camera' => 4199, 'charging_port' => 2199],
                ],
                [
                    'name' => 'iPhone 12',
                    'variants' => ['64GB', '128GB', '256GB'],
                    'repairs' => ['screen' => 5999, 'battery' => 1799, 'rear_housing' => 4599, 'camera' => 3899, 'charging_port' => 1999],
                ],
                [
                    'name' => 'iPhone 11',
                    'variants' => ['64GB', '128GB', '256GB'],
                    'repairs' => ['screen' => 4999, 'battery' => 1699, 'charging_port' => 1899],
                ],
            ],
        ],
        [
            'key' => 'ipad',
            'label' => 'iPad',
            'variant_label' => 'Storage',
            'image' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
            'models' => [
                [
                    'name' => 'iPad Pro 11-inch (M4)',
                    'variants' => ['256GB', '512GB', '1TB', '2TB'],
                    'repairs' => ['screen' => 12999, 'battery' => 3499, 'charging_port' => 2899],
                ],
                [
                    'name' => 'iPad Air 11-inch (M2)',
                    'variants' => ['128GB', '256GB', '512GB'],
                    'repairs' => ['screen' => 8999, 'battery' => 2999, 'charging_port' => 2599],
                ],
                [
                    'name' => 'iPad (10th generation)',
                    'variants' => ['64GB', '256GB'],
                    'repairs' => ['screen' => 5999, 'battery' => 2499, 'charging_port' => 2199],
                ],
            ],
        ],
        [
            'key' => 'mac',
            'label' => 'Mac',
            'variant_label' => 'Configuration',
            'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
            'models' => [
                [
                    'name' => 'MacBook Air 13-inch (M3)',
                    'variants' => ['8GB / 256GB', '16GB / 512GB', '24GB / 1TB'],
                    'repairs' => ['screen' => 12999, 'battery' => 3499, 'keyboard' => 4999, 'charging_port' => 2999],
                ],
                [
                    'name' => 'MacBook Pro 14-inch (M3)',
                    'variants' => ['18GB / 512GB', '18GB / 1TB', '36GB / 1TB'],
                    'repairs' => ['screen' => 17999, 'battery' => 4299, 'keyboard' => 5499, 'charging_port' => 3299],
                ],
                [
                    'name' => 'MacBook Pro 16-inch (M3 Pro)',
                    'variants' => ['18GB / 512GB', '36GB / 1TB', '48GB / 2TB'],
                    'repairs' => ['screen' => 21999, 'battery' => 4799, 'keyboard' => 5999, 'charging_port' => 3299],
                ],
            ],
        ],
        [
            'key' => 'watch',
            'label' => 'Apple Watch',
            'variant_label' => 'Case size',
            'image' => 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80',
            'models' => [
                [
                    'name' => 'Apple Watch Series 9',
                    'variants' => ['41mm', '45mm'],
                    'repairs' => ['screen' => 4999, 'battery' => 1899],
                ],
                [
                    'name' => 'Apple Watch Ultra 2',
                    'variants' => ['49mm'],
                    'repairs' => ['screen' => 8499, 'battery' => 2499],
                ],
                [
                    'name' => 'Apple Watch SE (2nd generation)',
                    'variants' => ['40mm', '44mm'],
                    'repairs' => ['screen' => 3499, 'battery' => 1699],
                ],
            ],
        ],
    ];

    /** Memoised per request — the selector and request validation both read it. */
    private static ?array $memoProducts = null;

    /**
     * Full catalogue, shaped for the front-end selector. Each repair option is
     * expanded to { key, label, price, same_day } so the page needs no lookups.
     *
     * Reads the admin-managed tables, falling back to the constants above while
     * they are empty or unmigrated.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function products(): array
    {
        if (self::$memoProducts !== null) {
            return self::$memoProducts;
        }

        $fromDatabase = rescue(fn () => self::productsFromDatabase(), null, false);

        return self::$memoProducts = $fromDatabase ?: self::expandFallback();
    }

    /**
     * Admin-editable service options, merged over the defaults.
     *
     * @return array<string, mixed>
     */
    public static function serviceOptions(): array
    {
        return Settings::group('repairs', self::SERVICE_DEFAULTS);
    }

    /**
     * The configured failed-inspection levy.
     */
    public static function ineligibleLevy(): float
    {
        return (float) (self::serviceOptions()['ineligible_levy'] ?? self::INELIGIBLE_LEVY);
    }

    /**
     * Service modes currently on offer, as { key, label } pairs.
     *
     * @return array<int, array<string, string>>
     */
    public static function serviceModes(): array
    {
        $options = self::serviceOptions();
        $modes = [];

        if ($options['offer_in_store'] ?? true) {
            $modes[] = ['key' => 'in_store', 'label' => 'Book an in-store appointment'];
        }

        if ($options['offer_home_collection'] ?? true) {
            $modes[] = ['key' => 'home_collection', 'label' => 'Arrange a home collection'];
        }

        // Never leave the booking form with nothing to choose.
        return $modes ?: [['key' => 'in_store', 'label' => 'Book an in-store appointment']];
    }

    /**
     * Service mode keys accepted by the booking request.
     *
     * @return array<int, string>
     */
    public static function serviceModeKeys(): array
    {
        return array_column(self::serviceModes(), 'key');
    }

    /**
     * Bookable time slots.
     *
     * @return array<int, string>
     */
    public static function timeSlots(): array
    {
        $slots = self::serviceOptions()['time_slots'] ?? [];

        return is_array($slots) && $slots !== [] ? array_values($slots) : self::SERVICE_DEFAULTS['time_slots'];
    }

    /**
     * Repair type key => label.
     *
     * Includes retired types so an old booking's repair_type still resolves to
     * a readable name after the type is deactivated.
     *
     * @return array<string, string>
     */
    public static function repairTypeLabels(): array
    {
        $labels = rescue(
            fn () => RepairType::orderBy('sort_order')->orderBy('id')->pluck('label', 'key')->all(),
            [],
            false
        );

        return $labels ? array_merge(self::REPAIR_TYPES, $labels) : self::REPAIR_TYPES;
    }

    /**
     * Every repair type key a booking may reference, for request validation.
     *
     * @return array<int, string>
     */
    public static function repairTypeKeys(): array
    {
        return array_keys(self::repairTypeLabels());
    }

    /**
     * Every device model name in the catalogue, for request validation.
     *
     * @return array<int, string>
     */
    public static function modelNames(): array
    {
        $names = [];

        foreach (self::products() as $product) {
            foreach ($product['models'] as $model) {
                $names[] = $model['name'];
            }
        }

        return $names;
    }

    /**
     * Repair categories for the /apple-product-repair landing page: one entry
     * per repair type, listing the models it is offered on.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function categories(): array
    {
        $categories = [];

        foreach (self::products() as $product) {
            foreach ($product['models'] as $model) {
                foreach ($model['repairs'] as $repair) {
                    $key = $repair['key'];

                    if (! isset($categories[$key])) {
                        $categories[$key] = [
                            'key' => $key,
                            'title' => $repair['label'],
                            'description' => $repair['description'] ?: '',
                            'models' => [],
                        ];
                    }

                    $categories[$key]['models'][] = $model['name'];
                }
            }
        }

        // A model appears once per repair type, so de-duplicate the lists.
        return array_values(array_map(static function (array $category) {
            $category['models'] = array_values(array_unique($category['models']));

            return $category;
        }, $categories));
    }

    /**
     * Drop the per-request memo, so an admin edit is reflected on the redirect.
     */
    public static function flush(): void
    {
        self::$memoProducts = null;
    }

    /**
     * @return array<int, array<string, mixed>>|null  null when nothing is configured yet
     */
    private static function productsFromDatabase(): ?array
    {
        $devices = RepairDevice::where('is_active', true)
            ->with(['models' => fn ($query) => $query->where('is_active', true)->with('prices')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        if ($devices->isEmpty()) {
            return null;
        }

        $types = RepairType::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->keyBy('id');

        $products = $devices->map(function (RepairDevice $device) use ($types) {
            $models = $device->models
                ->map(function ($model) use ($types) {
                    $repairs = $model->prices
                        ->filter(fn ($price) => $price->is_available && $types->has($price->repair_type_id))
                        ->map(function ($price) use ($types) {
                            $type = $types[$price->repair_type_id];

                            return [
                                'key' => $type->key,
                                'label' => $type->label,
                                'description' => (string) $type->description,
                                'price' => (float) $price->price,
                                'same_day' => (bool) $type->is_same_day,
                                'sort_order' => (int) $type->sort_order,
                            ];
                        })
                        ->sortBy('sort_order')
                        ->values()
                        ->all();

                    return [
                        'name' => $model->name,
                        'variants' => $model->variants ?: [],
                        'repairs' => $repairs,
                    ];
                })
                // A model with no priced repairs is a dead end in the selector.
                ->filter(fn (array $model) => $model['repairs'] !== [])
                ->values()
                ->all();

            return [
                'key' => $device->key,
                'label' => $device->label,
                'variant_label' => $device->variant_label,
                'image' => $device->image_path,
                'models' => $models,
            ];
        })
        ->filter(fn (array $product) => $product['models'] !== [])
        ->values()
        ->all();

        return $products ?: null;
    }

    /**
     * Expand the hard-coded fallback into the shape the selector expects.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function expandFallback(): array
    {
        return array_map(static function (array $product) {
            $product['models'] = array_map(static function (array $model) {
                $repairs = [];

                foreach ($model['repairs'] as $key => $price) {
                    $repairs[] = [
                        'key' => $key,
                        'label' => self::REPAIR_TYPES[$key] ?? $key,
                        'description' => '',
                        'price' => (float) $price,
                        'same_day' => in_array($key, self::SAME_DAY_TYPES, true),
                    ];
                }

                $model['repairs'] = $repairs;

                return $model;
            }, $product['models']);

            return $product;
        }, self::FALLBACK_PRODUCTS);
    }
}
