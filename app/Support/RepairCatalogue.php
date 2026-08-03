<?php

namespace App\Support;

/**
 * Repair catalogue backing the /services repair selector (Product → Model →
 * Storage → Repair type → indicative price).
 *
 * Structured after istore.co.za/apple-product-repair. Deliberately avoids
 * "Apple Certified" / "Apple Authorised" wording — see the compliance note on
 * RepairController. Keep it that way unless iPoint is registered as an Apple
 * Authorised Service Provider.
 *
 * PRICES ARE INDICATIVE PLACEHOLDERS in ZAR and must be confirmed against the
 * client's real repair price list before go-live. The page renders them with a
 * "subject to assessment" disclaimer.
 */
class RepairCatalogue
{
    /**
     * Levy applied to devices that fail the eligibility inspection, in ZAR.
     */
    public const INELIGIBLE_LEVY = 750;

    /**
     * Repair type key => customer-facing label. Keys are persisted on
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
     * Repair types eligible for same-day turnaround at participating stores.
     */
    public const SAME_DAY_TYPES = ['screen', 'battery'];

    private const PRODUCTS = [
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

    /**
     * Full catalogue, shaped for the front-end selector. Each repair option is
     * expanded to { key, label, price, same_day } so the page needs no lookups.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function products(): array
    {
        return array_map(static function (array $product) {
            $product['models'] = array_map(static function (array $model) {
                $repairs = [];

                foreach ($model['repairs'] as $key => $price) {
                    $repairs[] = [
                        'key' => $key,
                        'label' => self::REPAIR_TYPES[$key] ?? $key,
                        'price' => $price,
                        'same_day' => in_array($key, self::SAME_DAY_TYPES, true),
                    ];
                }

                $model['repairs'] = $repairs;

                return $model;
            }, $product['models']);

            return $product;
        }, self::PRODUCTS);
    }

    /**
     * Every repair type key the catalogue can produce, for request validation.
     *
     * @return array<int, string>
     */
    public static function repairTypeKeys(): array
    {
        return array_keys(self::REPAIR_TYPES);
    }

    /**
     * Every device model name in the catalogue, for request validation.
     *
     * @return array<int, string>
     */
    public static function modelNames(): array
    {
        $names = [];

        foreach (self::PRODUCTS as $product) {
            foreach ($product['models'] as $model) {
                $names[] = $model['name'];
            }
        }

        return $names;
    }
}
