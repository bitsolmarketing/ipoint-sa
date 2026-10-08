<?php

namespace App\Http\Controllers;

use App\Models\AttributeGroup;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\Banner;
use App\Models\Offer;
use App\Models\Color;
use App\Models\Size;
use App\Models\RepairLocation;
use App\Http\Controllers\Admin\AdminOfferController;
use App\Support\RepairCatalogue;
use App\Support\Settings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    /**
     * Display the store homepage.
     */
    public function home()
    {
        $heroBanners = Banner::where('is_active', true)
            ->where('position', 'hero')
            ->orderBy('sort_order')
            ->get();

        $featuredProducts = Product::where('is_featured', true)
            ->with(['variants.color', 'variants.size'])
            ->take(8)
            ->get();

        $promoProducts = Product::where('is_on_promo', true)
            ->with(['variants.color', 'variants.size'])
            ->take(8)
            ->get();

        $newProducts = Product::where('is_new', true)
            ->with(['variants.color', 'variants.size'])
            ->take(10)
            ->get();

        // Admin-managed "Latest Offers" carousel (Redesign Guide §4.4)
        $offers = Offer::live()->orderBy('sort_order')->orderBy('id')->get();

        // Heading copy + on/off switch for that carousel (Admin → Offers).
        $offersSection = Settings::group('offers', AdminOfferController::SECTION_DEFAULTS);

        // Promotional banner strips between homepage sections (admin-managed).
        // Each slot renders the first active banner for its position and hides when empty.
        $promoBannerPrimary = Banner::where('is_active', true)
            ->where('position', 'spotlight')
            ->orderBy('sort_order')
            ->first();

        $promoBannerSecondary = Banner::where('is_active', true)
            ->where('position', 'zigzag')
            ->orderBy('sort_order')
            ->first();

        // "Apple Authorized Accessories" shelf — genuine accessory products
        $accessories = Product::whereHas('category', fn ($q) => $q->where('slug', 'accessories'))
            ->with(['variants.color', 'variants.size'])
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->take(8)
            ->get();

        // Tabbed "Product Categories" browser — 3 products per category tab
        $categoryTabs = Category::orderBy('nav_order')
            ->get()
            ->map(function ($cat) {
                $cat->products = Product::where('category_id', $cat->id)
                    ->with(['variants.color', 'variants.size'])
                    ->orderByDesc('is_featured')
                    ->orderByDesc('created_at')
                    ->take(3)
                    ->get();
                return $cat;
            })
            ->filter(fn($cat) => $cat->products->isNotEmpty())
            ->values();

        return Inertia::render('Storefront/Home', [
            'heroBanners' => $heroBanners,
            'featuredProducts' => $featuredProducts,
            'promoProducts' => $promoProducts,
            'newProducts' => $newProducts,
            'offers' => $offers,
            'offersSection' => $offersSection,
            'categoryTabs' => $categoryTabs,
            'promoBannerPrimary' => $promoBannerPrimary,
            'promoBannerSecondary' => $promoBannerSecondary,
            'accessories' => $accessories,
        ]);
    }

    /**
     * Display the category page with filters.
     */
    public function category(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        
        $query = Product::where('category_id', $category->id)
            ->with(['variants.color', 'variants.size']);

        // Apply Price Filter
        if ($request->filled('price_min')) {
            $query->where('base_price', '>=', $request->input('price_min'));
        }
        if ($request->filled('price_max')) {
            $query->where('base_price', '<=', $request->input('price_max'));
        }

        // Apply Color Filter
        if ($request->filled('colors')) {
            $colorNames = is_array($request->input('colors')) ? $request->input('colors') : explode(',', $request->input('colors'));
            $query->whereHas('variants.color', function ($q) use ($colorNames) {
                $q->whereIn('name', $colorNames);
            });
        }

        // Apply Size Filter
        if ($request->filled('sizes')) {
            $sizeNames = is_array($request->input('sizes')) ? $request->input('sizes') : explode(',', $request->input('sizes'));
            $query->whereHas('variants.size', function ($q) use ($sizeNames) {
                $q->whereIn('name', $sizeNames);
            });
        }

        // Apply attribute filters
        foreach (AttributeGroup::where('is_active', true)->get() as $attrGroup) {
            $paramKey = 'attr_' . $attrGroup->slug;
            if ($request->filled($paramKey)) {
                $attrSlugs = is_array($request->input($paramKey)) 
                    ? $request->input($paramKey) 
                    : explode(',', $request->input($paramKey));
                $query->whereHas('attributeValues', function ($q) use ($attrGroup, $attrSlugs) {
                    $q->where('attribute_group_id', $attrGroup->id)
                      ->whereIn('slug', $attrSlugs);
                });
            }
        }

        // Apply Sorting
        $sort = $request->input('sort', 'featured');
        if ($sort === 'price_asc') {
            $query->orderBy('base_price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('base_price', 'desc');
        } elseif ($sort === 'newest') {
            $query->orderBy('created_at', 'desc');
        } else {
            // Default sorting: featured first, then new
            $query->orderBy('is_featured', 'desc')->orderBy('is_new', 'desc');
        }

        $products = $query->get();

        // Get filter options (colors and sizes present in this category)
        $availableColors = Color::whereHas('variants.product', function ($q) use ($category) {
            $q->where('category_id', $category->id);
        })->get();

        $availableSizes = Size::whereHas('variants.product', function ($q) use ($category) {
            $q->where('category_id', $category->id);
        })->get();

        // Get attribute groups that have values assigned to products in this category
        $availableAttributes = AttributeGroup::where('is_active', true)
            ->with(['values' => function ($q) use ($category) {
                $q->whereHas('products', function ($pq) use ($category) {
                    $pq->where('category_id', $category->id);
                })->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn ($group) => $group->values->isNotEmpty())
            ->values();

        return Inertia::render('Storefront/Category', [
            'category' => $category,
            'products' => $products,
            'filters' => [
                'price_min' => $request->input('price_min', ''),
                'price_max' => $request->input('price_max', ''),
                'selected_colors' => $request->input('colors', []),
                'selected_sizes' => $request->input('sizes', []),
                'sort' => $sort,
            ],
            'availableColors' => $availableColors,
            'availableSizes' => $availableSizes,
            'availableAttributes' => $availableAttributes,
            'activeAttributeFilters' => collect($request->all())
                ->filter(fn($v, $k) => str_starts_with($k, 'attr_'))
                ->mapWithKeys(fn($v, $k) => [str_replace('attr_', '', $k) => is_array($v) ? $v : explode(',', $v)])
                ->toArray(),
        ]);
    }

    /**
     * Display every product across all categories (the "View All Products" catalog).
     * Category filtering and sorting are handled client-side for instant response.
     */
    public function products()
    {
        $products = Product::with(['variants.color', 'variants.size'])
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->get();

        $categories = Category::orderBy('nav_order')->get(['id', 'name', 'slug']);

        return Inertia::render('Storefront/AllProducts', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Display product detail page.
     */
    public function product($slug)
    {
        $product = Product::where('slug', $slug)
            ->with(['category', 'variants.color', 'variants.size', 'reviews' => function ($q) {
                // Only approved reviews are shown on the storefront (moderation §7.3).
                $q->where('is_approved', true)->orderBy('created_at', 'desc');
            }])
            ->firstOrFail();

        // Get related products (same category, excluding self)
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['variants.color', 'variants.size'])
            ->take(4)
            ->get();

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Store a product review.
     */
    public function storeReview(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'reviewer_name' => 'required|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $product->reviews()->create([
            'reviewer_name' => $request->input('reviewer_name'),
            'rating' => $request->input('rating'),
            'comment' => $request->input('comment'),
            'is_approved' => false, // held for moderation (§7.3)
        ]);

        return redirect()->back()->with('success', 'Thanks! Your review has been submitted and will appear once approved.');
    }

    /**
     * API to track order status.
     */
    public function trackOrderApi($id)
    {
        $cleanId = preg_replace('/[^0-9]/', '', $id);
        
        if ($cleanId > 100000) {
            $cleanId -= 100000;
        }

        $order = \App\Models\Order::with(['items.variant.product', 'items.variant.color', 'items.variant.size'])
            ->find($cleanId);

        if (!$order) {
            return response()->json(['error' => 'Order not found.'], 404);
        }

        return response()->json($order);
    }

    /**
     * Display the contact page.
     */
    public function contact()
    {
        return Inertia::render('Storefront/Contact');
    }

    /**
     * Display the about page.
     */
    public function about()
    {
        return Inertia::render('Storefront/About');
    }

    /**
     * Display the services page.
     */
    public function services()
    {
        return Inertia::render('Storefront/Services', [
            'products' => RepairCatalogue::products(),
            'ineligibleLevy' => RepairCatalogue::ineligibleLevy(),
            'repairOptions' => RepairCatalogue::serviceOptions(),
            'locationCount' => RepairLocation::where('is_active', true)->count(),
        ]);
    }

    /**
     * Display the privacy policy page.
     */
    public function privacy()
    {
        return Inertia::render('Storefront/Privacy');
    }

    /**
     * Display the repair and service terms and conditions page.
     */
    public function terms()
    {
        return Inertia::render('Storefront/Terms');
    }

    /**
     * Display the returns policy page.
     */
    public function returns()
    {
        return Inertia::render('Storefront/Returns');
    }
}
