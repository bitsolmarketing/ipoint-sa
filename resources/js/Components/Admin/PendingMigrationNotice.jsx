import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

/**
 * Shown when a screen's tables have not been created yet.
 *
 * Code is deployed by pulling the repo (hPanel → GIT → Redeploy) while
 * migrations are run separately through the token-guarded /__setup route, so
 * there is always a window where a controller exists but its tables do not.
 * Without this the page dies with a 500 and a stack trace.
 *
 * @param {string[]} tables  Names of the missing tables
 */
export default function PendingMigrationNotice({ tables = [] }) {
    if (!tables.length) return null;

    return (
        <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />

                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        Database update required
                    </h2>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 mt-1 leading-relaxed">
                        This feature was deployed but its database tables have not been created yet, so the screen is
                        read-only until the migrations run. Nothing on the storefront is affected — it falls back to the
                        previous behaviour automatically.
                    </p>

                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Database className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                        {tables.map((table) => (
                            <code
                                key={table}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200"
                            >
                                {table}
                            </code>
                        ))}
                    </div>

                    <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 mt-3 leading-relaxed">
                        Run <code className="font-mono">php artisan migrate</code>, or on hosting without SSH set
                        {' '}<code className="font-mono">SETUP_TOKEN</code> in the <code className="font-mono">.env</code> above
                        the web root and visit <code className="font-mono">/__setup/&lt;token&gt;</code> — then blank the token
                        again. Do <span className="font-bold">not</span> add <code className="font-mono">?fresh=1</code>;
                        that wipes every product, order and customer.
                    </p>
                </div>
            </div>
        </div>
    );
}
