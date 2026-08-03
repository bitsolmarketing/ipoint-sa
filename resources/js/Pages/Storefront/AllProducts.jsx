import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Scale, Package, Sparkles, RotateCcw } from 'lucide-react';

export default function AllProducts({ products = [], categories = [] }) {
    // Client-side category filter + sort for instant response (whole catalog is loaded).
    const [activeCategory, setActiveCategory] = useState('all');
    const [sort, setSort] = useState('featured');

    const addToCompare = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(route('compare.add'), { product_id: id }, { preserveScroll: true, preserveState: true });
    };

    const displayedProducts = useMemo(() => {
        let list = activeCategory === 'all'
            ? [...products]
            : products.filter((p) => p.category_id === activeCategory);

        switch (sort) {
            case 'price_asc':
                list.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
                break;
            case 'price_desc':
                list.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
                break;
            case 'newest':
                list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default:
                // Featured first, then newest — mirrors the server default ordering.
                list.sort((a, b) => (b.is_featured === true) - (a.is_featured === true));
        }
        return list;
    }, [products, activeCategory, sort]);

    return (
        <StorefrontLayout>
            <Head title="All Products — Shop Apple" />

            {/* Jumbotron Header */}
            <section className="bg-white dark:bg-surface-dark border-b border-line dark:border-gray-800 py-10 px-6 sm:px-12 text-center">
                <div className="max-w-3xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center space-x-1.5 text-[11px] text-subtle mb-4" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-brand transition-colors font-medium">Home</Link>
                        <span className="text-gray-300">›</span>
                        <span className="text-heading dark:text-white font-semibold">All Products</span>
                    </nav>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-heading dark:text-white tracking-tight">
                        All Products
                    </h1>
                    <p className="text-sm sm:text-base text-muted dark:text-subtle mt-4 leading-relaxed font-normal">
                        Browse the complete Apple lineup across every category.
                    </p>
                </div>
            </section>

            {/* Category filter pills + sort toolbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                            activeCategory === 'all'
                                ? 'bg-success border-success text-white'
                                : 'bg-transparent border-success text-success hover:bg-success/10'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => {
                        const isActive = cat.id === activeCategory;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-success border-success text-white'
                                        : 'bg-transparent border-success text-success hover:bg-success/10'
                                }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Products area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-center space-y-3 sm:space-y-0 pb-4 border-b border-line dark:border-gray-800 text-xs">
                    <span className="font-medium text-muted">
                        Showing {displayedProducts.length} products
                    </span>

                    {/* Sort Dropdown */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl">
                        <span className="text-subtle font-medium">Sort by:</span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="border-none bg-transparent p-0 text-xs font-semibold focus:ring-0 focus:outline-none text-heading dark:text-white"
                        >
                            <option value="featured">Featured First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest Releases</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {displayedProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl">
                        <RotateCcw className="w-12 h-12 text-gray-300 stroke-[1.25] mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No products in this category yet</h3>
                        <p className="text-xs text-subtle mt-1">Try selecting a different category above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {displayedProducts.map((prod) => {
                            // Extract unique colors
                            const prodColors = [];
                            prod.variants.forEach((v) => {
                                if (v.color && !prodColors.includes(v.color.name)) {
                                    prodColors.push(v.color.name);
                                }
                            });

                            const isGoldDesire = prod.listing_type === 'gold_desire';

                            return (
                                <Link
                                    key={prod.id}
                                    href={`/products/${prod.slug}`}
                                    className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-[4px] p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                                >
                                    <div className="relative">
                                        {/* Listing-type badge */}
                                        <span className={`absolute top-1 left-1 z-10 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                            isGoldDesire
                                                ? 'bg-gold-tint text-gold dark:bg-gold/20 dark:text-gold-light'
                                                : 'bg-brand-tint-alt text-brand dark:bg-blue-950/40 dark:text-blue-300'
                                        }`}>
                                            {isGoldDesire ? <><Sparkles className="w-2.5 h-2.5" /> Gold Desire</> : <><Package className="w-2.5 h-2.5" /> Box Pack</>}
                                        </span>

                                        {/* Add to Compare */}
                                        <button
                                            type="button"
                                            onClick={(e) => addToCompare(e, prod.id)}
                                            title="Add to Compare"
                                            className="absolute top-1 right-1 z-10 p-1.5 rounded-full bg-white/90 dark:bg-black/50 border border-gray-150 dark:border-gray-700 text-muted hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Scale className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Image */}
                                        <div className="h-48 w-full flex items-center justify-center overflow-hidden my-2 bg-transparent">
                                            <img
                                                src={prod.image_path}
                                                alt={prod.name}
                                                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Apple-style subtle horizontal divider line before text detail */}
                                        <div className="border-t border-gray-100 dark:border-gray-800/60 my-4" />
                                    </div>

                                    <div className="text-left space-y-1 mt-auto">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                                            {prod.name}
                                        </h3>

                                        {/* Product Specifications Subtitle */}
                                        <p className="text-[11px] text-muted dark:text-subtle font-medium">
                                            {isGoldDesire
                                                ? `Grade ${prod.condition_grade || 'A'}${prod.battery_health ? ` · Battery ${prod.battery_health}%` : ''}`
                                                : (prodColors.length > 0 ? `(${prodColors.join(', ')})` : '(Standard Variant)')}
                                        </p>
                                        <p className="text-sm font-extrabold text-brand">R {parseFloat(prod.base_price).toLocaleString()}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
