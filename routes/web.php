<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\CompareController;
use App\Http\Controllers\RepairController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminColorController;
use App\Http\Controllers\Admin\AdminSizeController;
use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminAttributeController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminOfferController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminRepairController;
use App\Http\Controllers\Admin\AdminRepairCatalogueController;
use App\Http\Controllers\Admin\AdminAppearanceController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminMigrationController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

// --- Storefront Routes ---
Route::get('/', [StorefrontController::class, 'home'])->name('storefront.home');
Route::get('/category/{slug}', [StorefrontController::class, 'category'])->name('storefront.category');
Route::get('/products', [StorefrontController::class, 'products'])->name('storefront.products');
Route::get('/products/{slug}', [StorefrontController::class, 'product'])->name('storefront.product');
Route::post('/products/{id}/reviews', [StorefrontController::class, 'storeReview'])->name('storefront.product.reviews.store');
Route::get('/search', [SearchController::class, 'search'])->name('storefront.search');
Route::get('/api/orders/track/{id}', [StorefrontController::class, 'trackOrderApi'])->name('api.orders.track');
Route::get('/contact', [StorefrontController::class, 'contact'])->name('storefront.contact');
Route::get('/about', [StorefrontController::class, 'about'])->name('storefront.about');
Route::get('/services', [StorefrontController::class, 'services'])->name('storefront.services');
Route::get('/privacy', [StorefrontController::class, 'privacy'])->name('storefront.privacy');
Route::get('/terms', [StorefrontController::class, 'terms'])->name('storefront.terms');
Route::get('/returns', [StorefrontController::class, 'returns'])->name('storefront.returns');

// --- Compare Products Tool (§4.5) ---
Route::get('/compare', [CompareController::class, 'index'])->name('compare.index');
Route::post('/compare/add', [CompareController::class, 'add'])->name('compare.add');
Route::post('/compare/remove', [CompareController::class, 'remove'])->name('compare.remove');
Route::post('/compare/clear', [CompareController::class, 'clear'])->name('compare.clear');

// --- Apple Product Repair (§8) ---
Route::get('/apple-product-repair', [RepairController::class, 'index'])->name('repair.index');
Route::post('/apple-product-repair/book', [RepairController::class, 'book'])->name('repair.book');

// --- Persistent media (admin uploads stored one level ABOVE the web root so they
//     survive Git redeploys that replace public_html; see AdminProductController). ---
Route::get('/media/{path}', function (string $path) {
    $base = realpath(dirname(base_path()) . '/media');
    abort_if($base === false, 404);

    // realpath() resolves any ../ tricks; then require the result to stay inside $base.
    $file = realpath($base . DIRECTORY_SEPARATOR . $path);
    abort_if(
        $file === false
        || ! str_starts_with($file, $base . DIRECTORY_SEPARATOR)
        || ! is_file($file),
        404
    );

    return response()->file($file, [
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('path', '[A-Za-z0-9_\-\/\.]+')->name('media.show');

// --- Cart Routes ---
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');

// --- Checkout Routes ---
Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout.index');
Route::post('/checkout/store', [OrderController::class, 'store'])->name('checkout.store');
Route::get('/checkout/success/{id}', [OrderController::class, 'success'])->name('checkout.success');

// --- Default Breeze Auth Route Redirect ---
Route::get('/dashboard', function () {
    if (auth()->user()->is_admin) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('storefront.home');
})->middleware(['auth', 'verified'])->name('dashboard');

// --- Profile Routes ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// --- Admin Dashboard Routes ---
Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Applies pending migrations after a deploy (no SSH on this host). Additive
    // only — never seeds, never drops. Surfaced by PendingMigrationNotice.
    Route::post('/system/migrate', [AdminMigrationController::class, 'run'])->name('system.migrate');

    // Resource Controllers for Admin CMS
    Route::resource('categories', AdminCategoryController::class);
    Route::post('/products/upload', [AdminProductController::class, 'uploadImage'])->name('products.upload');
    Route::resource('products', AdminProductController::class);
    Route::resource('colors', AdminColorController::class);
    Route::resource('sizes', AdminSizeController::class);
    Route::resource('banners', AdminBannerController::class);
    Route::resource('attributes', AdminAttributeController::class);

    // Site colour palette (Appearance)
    Route::get('/appearance', [AdminAppearanceController::class, 'index'])->name('appearance.index');
    Route::post('/appearance', [AdminAppearanceController::class, 'update'])->name('appearance.update');
    Route::post('/appearance/reset', [AdminAppearanceController::class, 'reset'])->name('appearance.reset');

    // Payment gateways, merchant onboarding & bank credentials
    Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments/checkout', [AdminPaymentController::class, 'updateCheckout'])->name('payments.checkout.update');
    Route::post('/payments/gateways/{provider}', [AdminPaymentController::class, 'updateGateway'])->name('payments.gateways.update');
    Route::post('/payments/gateways/{provider}/disconnect', [AdminPaymentController::class, 'disconnectGateway'])->name('payments.gateways.disconnect');
    Route::post('/payments/bank-accounts', [AdminPaymentController::class, 'storeBankAccount'])->name('payments.bank-accounts.store');
    Route::put('/payments/bank-accounts/{id}', [AdminPaymentController::class, 'updateBankAccount'])->name('payments.bank-accounts.update');
    Route::delete('/payments/bank-accounts/{id}', [AdminPaymentController::class, 'destroyBankAccount'])->name('payments.bank-accounts.destroy');

    // Latest Offers module (§4.4)
    Route::post('/offers/section', [AdminOfferController::class, 'updateSection'])->name('offers.section.update');
    Route::post('/offers/{id}/toggle', [AdminOfferController::class, 'toggle'])->name('offers.toggle');
    Route::post('/offers/{id}/reorder', [AdminOfferController::class, 'reorder'])->name('offers.reorder');
    Route::post('/offers/{id}/duplicate', [AdminOfferController::class, 'duplicate'])->name('offers.duplicate');
    Route::resource('offers', AdminOfferController::class)->except(['create', 'show', 'edit']);

    // Reviews moderation (§7.3)
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews/{id}/approve', [AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{id}/reject', [AdminReviewController::class, 'reject'])->name('reviews.reject');
    Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    // Repair catalogue — device categories, models, repair types, prices, options.
    // Declared before /repairs/{...} routes so "catalogue" is never read as an id.
    Route::get('/repairs/catalogue', [AdminRepairCatalogueController::class, 'index'])->name('repairs.catalogue');
    Route::post('/repairs/catalogue/seed', [AdminRepairCatalogueController::class, 'seedDefaults'])->name('repairs.seed');
    Route::post('/repairs/catalogue/options', [AdminRepairCatalogueController::class, 'updateOptions'])->name('repairs.options.update');

    Route::post('/repairs/types', [AdminRepairCatalogueController::class, 'storeType'])->name('repairs.types.store');
    Route::put('/repairs/types/{id}', [AdminRepairCatalogueController::class, 'updateType'])->name('repairs.types.update');
    Route::delete('/repairs/types/{id}', [AdminRepairCatalogueController::class, 'destroyType'])->name('repairs.types.destroy');

    Route::post('/repairs/devices', [AdminRepairCatalogueController::class, 'storeDevice'])->name('repairs.devices.store');
    Route::put('/repairs/devices/{id}', [AdminRepairCatalogueController::class, 'updateDevice'])->name('repairs.devices.update');
    Route::delete('/repairs/devices/{id}', [AdminRepairCatalogueController::class, 'destroyDevice'])->name('repairs.devices.destroy');

    Route::post('/repairs/models', [AdminRepairCatalogueController::class, 'storeModel'])->name('repairs.models.store');
    Route::put('/repairs/models/{id}', [AdminRepairCatalogueController::class, 'updateModel'])->name('repairs.models.update');
    Route::delete('/repairs/models/{id}', [AdminRepairCatalogueController::class, 'destroyModel'])->name('repairs.models.destroy');

    // Repair bookings & service locations (§8.5)
    Route::get('/repairs', [AdminRepairController::class, 'index'])->name('repairs.index');
    Route::put('/repairs/bookings/{id}', [AdminRepairController::class, 'updateBooking'])->name('repairs.bookings.update');
    Route::post('/repairs/locations', [AdminRepairController::class, 'storeLocation'])->name('repairs.locations.store');
    Route::put('/repairs/locations/{id}', [AdminRepairController::class, 'updateLocation'])->name('repairs.locations.update');
    Route::delete('/repairs/locations/{id}', [AdminRepairController::class, 'destroyLocation'])->name('repairs.locations.destroy');

    // Orders management
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}', [AdminOrderController::class, 'update'])->name('orders.update');
});

/*
|--------------------------------------------------------------------------
| TEMPORARY no-SSH setup runner (remove after deployment)
|--------------------------------------------------------------------------
| Lets you run migrations/seed from a browser on hosting without SSH.
| Guarded by SETUP_TOKEN in .env — it is DISABLED (404) while SETUP_TOKEN is
| blank, which is the default. To use:
|   1. Set SETUP_TOKEN to a long random string in .env.
|   2. First run:   /__setup/<token>?seed=1
|   3. Blank out SETUP_TOKEN again (or delete this block).
| Query flags: ?seed=1 also seeds demo data · ?fresh=1 wipes & reseeds (destructive).
*/
Route::get('/__setup/{token}', function (string $token) {
    $expected = (string) env('SETUP_TOKEN', '');
    abort_if($expected === '' || ! hash_equals($expected, $token), 404);

    $steps = [];

    if (request()->boolean('fresh')) {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
        $steps['migrate:fresh --seed'] = \Illuminate\Support\Facades\Artisan::output();
    } else {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $steps['migrate --force'] = \Illuminate\Support\Facades\Artisan::output();

        if (request()->boolean('seed')) {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
            $steps['db:seed --force'] = \Illuminate\Support\Facades\Artisan::output();
        }
    }

    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    $steps['optimize:clear'] = \Illuminate\Support\Facades\Artisan::output();

    $body = "ipointapple setup complete.\n>>> Now blank out SETUP_TOKEN in .env (or delete this route) <<<\n\n";
    foreach ($steps as $label => $output) {
        $body .= "==== {$label} ====\n{$output}\n";
    }

    return response($body, 200)->header('Content-Type', 'text/plain');
})->name('setup.run');

require __DIR__.'/auth.php';
