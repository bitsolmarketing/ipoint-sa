<?php

namespace Database\Seeders;

use App\Models\RepairDevice;
use App\Models\RepairModel;
use App\Models\RepairPrice;
use App\Models\RepairType;
use App\Support\RepairCatalogue;
use Illuminate\Database\Seeder;

/**
 * Imports the hard-coded repair catalogue into the admin-editable tables.
 *
 * Idempotent — it upserts by key, so it is safe to re-run and will not clobber
 * prices an admin has since edited (existing rows keep their values; only
 * missing rows are created).
 */
class RepairCatalogueSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Repair types
        $typeIds = [];
        $sort = 0;

        foreach (RepairCatalogue::REPAIR_TYPES as $key => $label) {
            $type = RepairType::firstOrCreate(
                ['key' => $key],
                [
                    'label' => $label,
                    'is_same_day' => in_array($key, RepairCatalogue::SAME_DAY_TYPES, true),
                    'is_active' => true,
                    'sort_order' => $sort++,
                ]
            );

            $typeIds[$key] = $type->id;
        }

        // 2. Devices, models and prices
        foreach (RepairCatalogue::FALLBACK_PRODUCTS as $deviceSort => $product) {
            $device = RepairDevice::firstOrCreate(
                ['key' => $product['key']],
                [
                    'label' => $product['label'],
                    'variant_label' => $product['variant_label'],
                    'image_path' => $product['image'],
                    'is_active' => true,
                    'sort_order' => $deviceSort,
                ]
            );

            foreach ($product['models'] as $modelSort => $modelData) {
                $model = RepairModel::firstOrCreate(
                    ['repair_device_id' => $device->id, 'name' => $modelData['name']],
                    [
                        'variants' => $modelData['variants'],
                        'is_active' => true,
                        'sort_order' => $modelSort,
                    ]
                );

                foreach ($modelData['repairs'] as $typeKey => $price) {
                    if (! isset($typeIds[$typeKey])) {
                        continue;
                    }

                    RepairPrice::firstOrCreate(
                        ['repair_model_id' => $model->id, 'repair_type_id' => $typeIds[$typeKey]],
                        ['price' => $price, 'is_available' => true]
                    );
                }
            }
        }
    }
}
