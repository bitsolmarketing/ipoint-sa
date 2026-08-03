import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { X, Scale, Plus, Trash2 } from 'lucide-react';

export default function Compare({ products }) {
    const remove = (id) => router.post(route('compare.remove'), { product_id: id }, { preserveScroll: true });
    const clearAll = () => router.post(route('compare.clear'), {}, { preserveScroll: true });

    // Aggregate a union of all technical-spec keys across the selected products,
    // preserving first-seen order (reuses the product page's technical_specs — §4.5).
    const specKeys = [];
    products.forEach((p) => {
        (p.technical_specs || []).forEach((s) => {
            if (s.spec_key && !specKeys.includes(s.spec_key)) specKeys.push(s.spec_key);
        });
    });

    const specValue = (product, key) => {
        const match = (product.technical_specs || []).find((s) => s.spec_key === key);
        return match ? match.spec_val : '—';
    };

    const money = (v) => 'R ' + parseFloat(v).toLocaleString();

    return (
        <StorefrontLayout>
            <Head title="Compare Products" />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                            <Scale className="w-3.5 h-3.5" /> Compare
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-heading dark:text-white tracking-tight mt-2">Compare products</h1>
                        <p className="text-sm text-muted dark:text-subtle mt-2">Line up specifications side by side to choose with confidence.</p>
                    </div>
                    {products.length > 0 && (
                        <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-sale self-start sm:self-auto">
                            <Trash2 className="w-4 h-4" /> Clear all
                        </button>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl">
                        <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your comparison is empty</h3>
                        <p className="text-xs text-subtle mt-1">Add up to 4 products using the “Add to Compare” button on any product.</p>
                        <Link href="/category/iphone" className="mt-6 inline-block px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full">
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-3xl bg-white dark:bg-surface-dark">
                        <table className="w-full border-collapse text-xs min-w-[640px]">
                            <thead>
                                <tr>
                                    <th className="w-40 p-4 text-left align-bottom text-[10px] font-bold uppercase tracking-wider text-subtle border-b border-gray-100 dark:border-gray-800">Product</th>
                                    {products.map((p) => (
                                        <th key={p.id} className="p-4 align-top border-b border-l border-gray-100 dark:border-gray-800 min-w-[180px]">
                                            <div className="flex flex-col items-center text-center space-y-2 relative">
                                                <button onClick={() => remove(p.id)} className="absolute -top-1 -right-1 p-1 rounded-full text-gray-300 hover:text-sale" title="Remove">
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <div className="h-24 w-full flex items-center justify-center">
                                                    <img src={p.image_path} alt={p.name} className="max-h-full max-w-full object-contain" />
                                                </div>
                                                <Link href={`/products/${p.slug}`} className="text-xs font-bold text-gray-900 dark:text-white hover:text-brand leading-snug">{p.name}</Link>
                                                <span className="text-sm font-extrabold text-brand">{money(p.base_price)}</span>
                                            </div>
                                        </th>
                                    ))}
                                    {products.length < 4 && (
                                        <th className="p-4 align-middle border-b border-l border-gray-100 dark:border-gray-800 min-w-[160px]">
                                            <Link href="/category/iphone" className="flex flex-col items-center justify-center gap-2 text-subtle hover:text-brand">
                                                <span className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center"><Plus className="w-4 h-4" /></span>
                                                <span className="text-[10px] font-bold">Add product</span>
                                            </Link>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 dark:text-gray-300">
                                <SpecRow label="Category" products={products} render={(p) => p.category?.name || '—'} />
                                <SpecRow label="Type" products={products} render={(p) => p.listing_type === 'gold_desire' ? 'Gold Desire (Refurbished)' : 'Box Pack (New)'} />
                                <SpecRow label="Condition" products={products} render={(p) => p.condition_grade ? `Grade ${p.condition_grade}` : (p.listing_type === 'gold_desire' ? '—' : 'New')} />
                                <SpecRow label="Battery Health" products={products} render={(p) => p.battery_health ? `${p.battery_health}%` : (p.listing_type === 'gold_desire' ? '—' : '100%')} />
                                <SpecRow label="Price" products={products} render={(p) => money(p.base_price)} strong />
                                {specKeys.map((key) => (
                                    <SpecRow key={key} label={key} products={products} render={(p) => specValue(p, key)} />
                                ))}
                                <tr>
                                    <td className="p-4 border-t border-gray-100 dark:border-gray-800" />
                                    {products.map((p) => (
                                        <td key={p.id} className="p-4 border-t border-l border-gray-100 dark:border-gray-800 text-center">
                                            <Link href={`/products/${p.slug}`} className="inline-block px-4 py-2 bg-brand hover:bg-brand-hover text-white text-[11px] font-bold rounded-full">View details</Link>
                                        </td>
                                    ))}
                                    {products.length < 4 && <td className="border-t border-l border-gray-100 dark:border-gray-800" />}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </StorefrontLayout>
    );
}

function SpecRow({ label, products, render, strong }) {
    return (
        <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
            <td className="p-4 font-bold text-[10px] uppercase tracking-wider text-subtle border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30">{label}</td>
            {products.map((p) => (
                <td key={p.id} className={`p-4 border-t border-l border-gray-100 dark:border-gray-800 text-center ${strong ? 'font-extrabold text-gray-900 dark:text-white' : ''}`}>
                    {render(p)}
                </td>
            ))}
            {products.length < 4 && <td className="border-t border-l border-gray-100 dark:border-gray-800" />}
        </tr>
    );
}
