<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * The in-panel "Run database update" button.
 *
 * Deploys and migrations are separate steps on this host, so the admin screens
 * have to survive the gap and then be able to close it themselves.
 */
class AdminMigrationTest extends TestCase
{
    use RefreshDatabase;

    private const REPAIR_TABLES = ['repair_prices', 'repair_models', 'repair_devices', 'repair_types'];

    private const REPAIR_MIGRATION = '2026_08_04_100005_create_repair_catalogue_tables';

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@example.test',
            'password' => bcrypt('secret-Password1'),
            'is_admin' => true,
        ]);
    }

    /**
     * Reproduce production: the code is deployed, the tables are not there.
     */
    private function unmigrateRepairTables(): void
    {
        Schema::disableForeignKeyConstraints();

        foreach (self::REPAIR_TABLES as $table) {
            Schema::dropIfExists($table);
        }

        Schema::enableForeignKeyConstraints();

        DB::table('migrations')->where('migration', self::REPAIR_MIGRATION)->delete();
    }

    public function test_catalogue_screen_reports_missing_tables_instead_of_erroring(): void
    {
        $this->unmigrateRepairTables();

        $response = $this->actingAs($this->admin())->get('/admin/repairs/catalogue');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Repairs/Catalogue')
            ->where('pendingMigration', ['repair_types', 'repair_devices', 'repair_models', 'repair_prices'])
        );
    }

    public function test_admin_can_apply_pending_migrations(): void
    {
        $this->unmigrateRepairTables();

        foreach (self::REPAIR_TABLES as $table) {
            $this->assertFalse(Schema::hasTable($table), "{$table} should be missing before the update");
        }

        $response = $this->actingAs($this->admin())->post('/admin/system/migrate');

        $response->assertRedirect();
        $response->assertSessionHas('success');

        foreach (self::REPAIR_TABLES as $table) {
            $this->assertTrue(Schema::hasTable($table), "{$table} should exist after the update");
        }
    }

    public function test_screen_recovers_once_the_migrations_have_run(): void
    {
        $this->unmigrateRepairTables();

        $admin = $this->admin();
        $this->actingAs($admin)->post('/admin/system/migrate');

        $this->actingAs($admin)
            ->get('/admin/repairs/catalogue')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('pendingMigration', []));
    }

    public function test_running_with_nothing_pending_is_a_no_op(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/system/migrate');

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $response->assertSessionMissing('success');
    }

    public function test_non_admins_cannot_run_migrations(): void
    {
        $customer = User::create([
            'name' => 'Customer',
            'email' => 'customer@example.test',
            'password' => bcrypt('secret-Password1'),
            'is_admin' => false,
        ]);

        $this->actingAs($customer)
            ->post('/admin/system/migrate')
            ->assertRedirect(route('storefront.home'));
    }

    public function test_guests_cannot_run_migrations(): void
    {
        $this->post('/admin/system/migrate')->assertRedirect(route('login'));
    }
}
