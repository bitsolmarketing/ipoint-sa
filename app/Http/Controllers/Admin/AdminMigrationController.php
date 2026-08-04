<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\RepairCatalogue;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

/**
 * Runs pending migrations from inside the admin panel.
 *
 * Code and schema arrive separately on this host: a release is a Git pull from
 * hPanel, and there is no SSH, so migrations previously meant editing the .env
 * above the web root to arm SETUP_TOKEN, hitting /__setup/<token>, then blanking
 * the token again — three manual steps on the server for every release that
 * ships a table. Until they happen the new admin screens sit read-only behind
 * PendingMigrationNotice. This does the same `migrate --force` behind the
 * existing admin auth instead.
 *
 * Deliberately narrower than the /__setup route: no --seed (DatabaseSeeder uses
 * bare create() calls and would duplicate every category and banner on a live
 * database) and no migrate:fresh (it drops every table). Additive only.
 */
class AdminMigrationController extends Controller
{
    public function run()
    {
        $pending = $this->pendingMigrations();

        if (! $pending) {
            return back()->with('error', 'The database is already up to date — there is nothing to migrate.');
        }

        try {
            Artisan::call('migrate', ['--force' => true]);
            $output = trim(Artisan::output());
        } catch (\Throwable $e) {
            // A half-applied batch is the one case worth reading the log for,
            // so keep the full trace rather than just the flashed message.
            Log::error('Admin-triggered migration failed', ['pending' => $pending, 'exception' => $e]);

            return back()->with('error', 'The database update failed and was rolled back: '.$e->getMessage());
        }

        Log::info('Admin ran pending migrations', ['migrations' => $pending, 'output' => $output]);

        // Cached config/routes can predate the tables that just appeared, and
        // the catalogue memoises its constants fallback per request.
        rescue(fn () => Artisan::call('optimize:clear'), null, false);
        RepairCatalogue::flush();

        $count = count($pending);

        return back()->with('success', $count === 1
            ? 'Database updated — 1 migration applied.'
            : "Database updated — {$count} migrations applied.");
    }

    /**
     * Migration files on disk that the migrations table has no record of.
     *
     * @return string[]
     */
    private function pendingMigrations(): array
    {
        $migrator = app('migrator');

        $onDisk = array_keys($migrator->getMigrationFiles(database_path('migrations')));

        // getRan() throws while the migrations table itself is missing (a brand
        // new database) — in that case everything on disk is pending.
        $ran = rescue(fn () => $migrator->getRepository()->getRan(), [], false);

        return array_values(array_diff($onDisk, $ran));
    }
}
