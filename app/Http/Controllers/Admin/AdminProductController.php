<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeGroup;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AdminProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        $products = Product::with('category')
            ->withCount(['variants', 'reviews'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        return Inertia::render('Admin/Products/Form', [
            'categories' => Category::orderBy('name')->get(),
            'colors' => Color::orderBy('name')->get(),
            'sizes' => Size::orderBy('name')->get(),
            'attributeGroups' => AttributeGroup::where('is_active', true)->with('values')->orderBy('sort_order')->get(),
            'isEdit' => false,
            'product' => null
        ]);
    }

    /**
     * Store a newly created product with variants in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'nullable|exists:categories,id',
            'listing_type' => 'nullable|in:box_pack,gold_desire',
            'condition_grade' => 'nullable|string|max:10',
            'cosmetic_notes' => 'nullable|string|max:1000',
            'battery_health' => 'nullable|integer|min:0|max:100',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'image_path' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'summary_specs' => 'nullable|array',
            'technical_specs' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_on_promo' => 'boolean',
            'variants' => 'required|array|min:1',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.sku' => 'required|string|unique:product_variants,sku',
            'variants.*.price_modifier' => 'required|numeric',
            'variants.*.stock' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $gallery = $request->input('gallery_images') ?: [];
            if (empty($gallery) && $request->filled('image_path')) {
                $gallery[] = $request->input('image_path');
            }

            $product = Product::create([
                'category_id' => $request->input('category_id'),
                'listing_type' => $request->input('listing_type', 'box_pack'),
                'condition_grade' => $request->input('condition_grade'),
                'cosmetic_notes' => $request->input('cosmetic_notes'),
                'battery_health' => $request->input('battery_health'),
                'name' => $request->input('name'),
                'slug' => Str::slug($request->input('name')),
                'description' => $request->input('description'),
                'summary_specs' => $request->input('summary_specs') ?: [],
                'technical_specs' => $request->input('technical_specs') ?: [],
                'base_price' => $request->input('base_price'),
                'original_price' => $request->input('original_price'),
                'image_path' => $request->input('image_path') ?: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
                'gallery_images' => $gallery ?: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80'],
                'is_featured' => $request->input('is_featured', false),
                'is_new' => $request->input('is_new', false),
                'is_on_promo' => $request->input('is_on_promo', false),
            ]);

            foreach ($request->input('variants') as $var) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'color_id' => $var['color_id'],
                    'size_id' => $var['size_id'],
                    'sku' => $var['sku'],
                    'price_modifier' => $var['price_modifier'],
                    'stock' => $var['stock'],
                ]);
            }

            $product->attributeValues()->sync($request->input('attribute_value_ids', []));

            DB::commit();

            return redirect()->route('admin.products.index')->with('success', 'Product and variants created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Error creating product: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit($id)
    {
        $product = Product::with('variants')->findOrFail($id);

        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
            'categories' => Category::orderBy('name')->get(),
            'colors' => Color::orderBy('name')->get(),
            'sizes' => Size::orderBy('name')->get(),
            'attributeGroups' => AttributeGroup::where('is_active', true)->with('values')->orderBy('sort_order')->get(),
            'selectedAttributeValues' => $product->attributeValues->pluck('id')->toArray(),
            'isEdit' => true
        ]);
    }

    /**
     * Update the specified product with variants in storage.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'nullable|exists:categories,id',
            'listing_type' => 'nullable|in:box_pack,gold_desire',
            'condition_grade' => 'nullable|string|max:10',
            'cosmetic_notes' => 'nullable|string|max:1000',
            'battery_health' => 'nullable|integer|min:0|max:100',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'image_path' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'summary_specs' => 'nullable|array',
            'technical_specs' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_on_promo' => 'boolean',
            'variants' => 'required|array|min:1',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.sku' => 'required|string',
            'variants.*.price_modifier' => 'required|numeric',
            'variants.*.stock' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $gallery = $request->input('gallery_images') ?: [];
            if (empty($gallery) && $request->filled('image_path')) {
                $gallery[] = $request->input('image_path');
            }

            $product->update([
                'category_id' => $request->input('category_id'),
                'listing_type' => $request->input('listing_type', 'box_pack'),
                'condition_grade' => $request->input('condition_grade'),
                'cosmetic_notes' => $request->input('cosmetic_notes'),
                'battery_health' => $request->input('battery_health'),
                'name' => $request->input('name'),
                'slug' => Str::slug($request->input('name')),
                'description' => $request->input('description'),
                'summary_specs' => $request->input('summary_specs') ?: [],
                'technical_specs' => $request->input('technical_specs') ?: [],
                'base_price' => $request->input('base_price'),
                'original_price' => $request->input('original_price'),
                'image_path' => $request->input('image_path') ?: $product->image_path,
                'gallery_images' => $gallery,
                'is_featured' => $request->input('is_featured', false),
                'is_new' => $request->input('is_new', false),
                'is_on_promo' => $request->input('is_on_promo', false),
            ]);

            // Re-generate/sync variants: delete current ones and insert new ones
            // Check for duplicate SKU inputs in the request itself
            $skus = array_column($request->input('variants'), 'sku');
            if (count($skus) !== count(array_unique($skus))) {
                throw new \Exception('SKU codes must be unique among the variants.');
            }

            // Check if SKU exists on other products' variants
            foreach ($skus as $sku) {
                $exists = ProductVariant::where('sku', $sku)->where('product_id', '!=', $product->id)->exists();
                if ($exists) {
                    throw new \Exception("SKU '{$sku}' is already taken by another product.");
                }
            }

            ProductVariant::where('product_id', $product->id)->delete();

            foreach ($request->input('variants') as $var) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'color_id' => $var['color_id'],
                    'size_id' => $var['size_id'],
                    'sku' => $var['sku'],
                    'price_modifier' => $var['price_modifier'],
                    'stock' => $var['stock'],
                ]);
            }

            $product->attributeValues()->sync($request->input('attribute_value_ids', []));

            DB::commit();

            return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete(); // This cascades and deletes product_variants too.

        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }

    /**
     * Handle drag-drop and input picker image files upload to public folder.
     */
    public function uploadImage(Request $request)
    {
        // Validate manually and return JSON on failure. Using $request->validate()
        // would 302-redirect for non-JSON requests, which the uploader's fetch()
        // can't parse (it surfaces as a generic "Image upload failed").
        $validator = Validator::make(
            ['file' => $request->file('file')],
            ['file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp,avif|max:10240'] // up to 10 MB
        );

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first('file')], 422);
        }

        // Which subfolder to file this image under. Allowlisted rather than taken
        // verbatim — the value becomes a path segment and a public URL.
        $folder = $request->input('folder', 'products');
        if (! in_array($folder, ['products', 'banners', 'categories', 'offers', 'repairs'], true)) {
            $folder = 'products';
        }

        try {
            $file = $request->file('file');
            $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
            $filename = time() . '_' . Str::random(10) . '.' . $ext;

            // Prefer a persistent folder ONE LEVEL ABOVE the app root. On Hostinger the
            // Git deploy replaces public_html (= app root) wholesale, wiping anything
            // uploaded inside it — the parent domain folder survives every deploy.
            // Served back via the /media/{path} route.
            $persistentDir = dirname(base_path()) . '/media/' . $folder;
            if (! is_dir($persistentDir)) {
                @mkdir($persistentDir, 0755, true);
            }

            if (is_dir($persistentDir) && is_writable($persistentDir)) {
                $file->move($persistentDir, $filename);

                return response()->json(['url' => '/media/' . $folder . '/' . $filename]);
            }

            // Fallback: the web root's uploads folder (works everywhere, but is
            // replaced on each Git redeploy).
            $dir = public_path('uploads/' . $folder);
            if (! is_dir($dir)) {
                @mkdir($dir, 0755, true);
            }

            if (! is_writable($dir)) {
                return response()->json([
                    'error' => "Neither the persistent media folder nor uploads/{$folder} is writable on the server. Set permissions to 755.",
                ], 500);
            }

            $file->move($dir, $filename);

            return response()->json(['url' => '/uploads/' . $folder . '/' . $filename]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }
}
