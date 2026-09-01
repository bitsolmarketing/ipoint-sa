import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Database, AlertTriangle, Play, Loader2, ChevronDown } from 'lucide-react';

/**
 * Shown when a screen's tables have not been created yet.
 *
 * Code is deployed by pulling the repo (hPanel → GIT → Redeploy) while the
 * schema is a separate step, so there is always a window where a controller
 * exists but its tables do not. Without this the page dies with a 500 and a
 * stack trace.
 *
 * The button runs the pending migrations in place (admin.system.migrate), which
 * is the whole reason this notice is not just a wall of instructions — the
 * manual SSH/SETUP_TOKEN routes are kept below as a fallback.
 *
 * @param {string[]} tables  Names of the missing tables (or columns)
 * @param {string}   [description]  Override for the explanatory copy, for
 *                                  cases where what's missing is a column on
 *                                  an existing table rather than a whole table
 */
export default function PendingMigrationNotice({ tables = [], description }) {
    const { post, processing } = useForm({});
    const [showManual, setShowManual] = useState(false);

    if (!tables.length) return null;

    const runMigrations = () => {
        if (!confirm('Create the missing database tables now?\n\nThis only adds new tables — no product, order or customer data is touched.')) {
            return;
        }

        post(route('admin.system.migrate'), { preserveScroll: true });
    };

    return (
        <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />

                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        Database update required
                    </h2>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 mt-1 leading-relaxed">
                        {description || 'This feature was deployed but its database tables have not been created yet, so the screen is '
                            + 'read-only until the update runs. Nothing on the storefront is affected — it falls back to the '
                            + 'previous behaviour automatically.'}
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

                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        <button
                            type="button"
                            onClick={runMigrations}
                            disabled={processing}
                            className="inline-flex items-center gap-2 text-[11px] font-bold px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating database…</>
                                : <><Play className="w-3.5 h-3.5" /> Run database update</>}
                        </button>

                        <span className="text-[11px] text-amber-800/70 dark:text-amber-200/60">
                            Adds the missing tables. Existing data is left alone.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowManual((open) => !open)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700/70 dark:text-amber-300/60 hover:text-amber-900 dark:hover:text-amber-200 mt-3"
                    >
                        <ChevronDown className={`w-3 h-3 transition-transform ${showManual ? 'rotate-180' : ''}`} />
                        Run it manually instead
                    </button>

                    {showManual && (
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 mt-2 leading-relaxed">
                            Run <code className="font-mono">php artisan migrate</code>, or on hosting without SSH set
                            {' '}<code className="font-mono">SETUP_TOKEN</code> in the <code className="font-mono">.env</code> above
                            the web root and visit <code className="font-mono">/__setup/&lt;token&gt;</code> — then blank the token
                            again. Do <span className="font-bold">not</span> add <code className="font-mono">?fresh=1</code>;
                            that wipes every product, order and customer.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
