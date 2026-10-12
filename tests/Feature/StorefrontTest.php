<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    private $category;
    private $product;
    private $variant;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic structures
        $this->category = Category::create([
            'name' => 'iPhone',
            'slug' => 'iphone',
            'description' => 'Apple Phones',
            'image_path' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
            'nav_order' => 1
        ]);

        $this->product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'iPhone 15 Pro',
            'slug' => 'iphone-15-pro',
            'description' => 'Titanium build',
            'base_price' => 20999.00,
            'image_path' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
            'is_featured' => true,
            'is_new' => true,
        ]);

        $color = Color::create(['name' => 'Natural Titanium', 'hex_code' => '#a69f96']);
        $size = Size::create(['name' => '256GB', 'reference_value' => 'Storage']);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'color_id' => $color->id,
            'size_id' => $size->id,
            'sku' => 'IPH-1-NAT-256GB',
            'price_modifier' => 0.00,
            'stock' => 10
        ]);
    }

    /**
     * Test public storefront loading.
     */
    public function test_storefront_home_loads_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    /**
     * Test the About iPoint page loads.
     */
    public function test_about_page_loads_successfully(): void
    {
        $response = $this->get('/about');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Storefront/About'));
    }

    /**
     * Test the repair and service terms and conditions page loads.
     */
    public function test_terms_page_loads_successfully(): void
    {
        $response = $this->get('/terms');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Storefront/Terms'));
    }

    /**
     * Test the returns policy page loads.
     */
    public function test_returns_page_loads_successfully(): void
    {
        $response = $this->get('/returns');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Storefront/Returns'));
    }

    /**
     * Test the governing policy page loads.
     */
    public function test_governing_policy_page_loads_successfully(): void
    {
        $response = $this->get('/governing-policy');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Storefront/Governing'));
    }

    /**
     * Test category listing loading.
     */
    public function test_storefront_category_loads_successfully(): void
    {
        $response = $this->get('/category/iphone');
        $response->assertStatus(200);
    }

    /**
     * Test product detail loading.
     */
    public function test_storefront_product_detail_loads_successfully(): void
    {
        $response = $this->get('/products/iphone-15-pro');
        $response->assertStatus(200);
    }

    /**
     * Test adding product to cart session.
     */
    public function test_add_to_cart_adds_item_to_session(): void
    {
        $response = $this->post('/cart/add', [
            'product_variant_id' => $this->variant->id,
            'quantity' => 2
        ]);

        $response->assertSessionHas('cart');
        $cart = session()->get('cart');
        
        $this->assertCount(1, $cart);
        $this->assertEquals(2, $cart[$this->variant->id]['quantity']);
    }

    /**
     * Test unauthorized access to admin dashboard redirects to storefront home.
     */
    public function test_unauthorized_user_is_redirected_from_admin_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin');
        $response->assertRedirect('/');
        $response->assertSessionHas('error', 'Unauthorized access.');
    }

    /**
     * Test authorized admin can access admin dashboard.
     */
    public function test_authorized_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertStatus(200);
    }

    /**
     * Test tracking order endpoint.
     */
    public function test_track_order_api_returns_order_details(): void
    {
        $user = User::factory()->create();
        
        $order = \App\Models\Order::create([
            'user_id' => $user->id,
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '1234567890',
            'shipping_address' => '123 Apple St',
            'city' => 'Sandton',
            'postal_code' => '2196',
            'total_amount' => 19999.00,
            'status' => 'paid',
        ]);

        $response = $this->get('/api/orders/track/' . $order->id);
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $order->id,
            'customer_name' => 'John Doe',
            'city' => 'Sandton',
        ]);

        $responseWithPrefix = $this->get('/api/orders/track/' . urlencode('#IST-' . (100000 + $order->id)));
        $responseWithPrefix->assertStatus(200);
        $responseWithPrefix->assertJsonFragment([
            'id' => $order->id,
        ]);
    }
}
