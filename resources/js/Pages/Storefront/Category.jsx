import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { SlidersHorizontal, ChevronDown, RotateCcw, X, Scale, Package, Sparkles } from 'lucide-react';

export default function Category({
    category,
    products,
    filters,
    availableColors,
    availableSizes,
    availableAttributes = [],
    activeAttributeFilters = {},
}) {
    const [priceMin, setPriceMin] = useState(filters.price_min || '');
    const [priceMax, setPriceMax] = useState(filters.price_max || '');
    const [selectedColors, setSelectedColors] = useState(
        filters.selected_colors ? (Array.isArray(filters.selected_colors) ? filters.selected_colors : [filters.selected_colors]) : []
    );
    const [selectedSizes, setSelectedSizes] = useState(
        filters.selected_sizes ? (Array.isArray(filters.selected_sizes) ? filters.selected_sizes : [filters.selected_sizes]) : []
    );
    const [sort, setSort] = useState(filters.sort || 'featured');

    // Box Pack / Gold Desire purchase-type tabs (§6). Shown when the category
    // holds both new (box_pack) and refurbished (gold_desire) units.
    const [listingTab, setListingTab] = useState('box_pack');
    const hasGoldDesire = useMemo(() => products.some((p) => p.listing_type === 'gold_desire'), [products]);
    const hasBoxPack = useMemo(() => products.some((p) => p.listing_type !== 'gold_desire'), [products]);
    const showListingTabs = hasGoldDesire && hasBoxPack;

    const displayedProducts = useMemo(() => {
        if (!showListingTabs) return products;
        return products.filter((p) =>
            listingTab === 'gold_desire' ? p.listing_type === 'gold_desire' : p.listing_type !== 'gold_desire'
        );
    }, [products, listingTab, showListingTabs]);

    const addToCompare = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(route('compare.add'), { product_id: id }, { preserveScroll: true, preserveState: true });
    };

    // Attribute filter state — keyed by group slug, values are arrays of value slugs
    const [selectedAttributes, setSelectedAttributes] = useState(() => {
        const initial = {};
        availableAttributes.forEach((group) => {
            const active = activeAttributeFilters[group.slug];
            initial[group.slug] = active ? (Array.isArray(active) ? active : [active]) : [];
        });
        return initial;
    });

    // Collapsible accordion state — all sections open by default
    const [openSections, setOpenSections] = useState(() => {
        const sections = {};
        availableAttributes.forEach((group) => {
            sections[`attr_${group.slug}`] = true;
        });
        sections['colour'] = true;
        sections['price'] = true;
        return sections;
    });

    const toggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // ----- Filter application -----
    const applyFilters = () => {
        const params = {
            price_min: priceMin,
            price_max: priceMax,
            colors: selectedColors.join(','),
            sizes: selectedSizes.join(','),
            sort: sort,
        };
        // Add attribute filters
        Object.entries(selectedAttributes).forEach(([groupSlug, valueSlugs]) => {
            if (valueSlugs.length > 0) {
                params[`attr_${groupSlug}`] = valueSlugs.join(',');
            }
        });
        router.get(route('storefront.category', category.slug), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // ----- Toggle handlers -----
    const handleColorToggle = (colorName) => {
        setSelectedColors((prev) =>
            prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
        );
    };

    const handleSizeToggle = (sizeName) => {
        setSelectedSizes((prev) =>
            prev.includes(sizeName) ? prev.filter((s) => s !== sizeName) : [...prev, sizeName]
        );
    };

    const handleAttributeToggle = (groupSlug, valueSlug) => {
        setSelectedAttributes((prev) => {
            const current = prev[groupSlug] || [];
            const updated = current.includes(valueSlug)
                ? current.filter((v) => v !== valueSlug)
                : [...current, valueSlug];
            return { ...prev, [groupSlug]: updated };
        });
    };

    // Auto-apply when reactive filters change
    useEffect(() => {
        applyFilters();
    }, [selectedColors, selectedSizes, sort, selectedAttributes]);

    // ----- Active filter chips -----
    const activeChips = useMemo(() => {
        const chips = [];

        // Attribute chips
        availableAttributes.forEach((group) => {
            const slugs = selectedAttributes[group.slug] || [];
            slugs.forEach((slug) => {
                const valueObj = group.values.find((v) => v.slug === slug);
                if (valueObj) {
                    chips.push({
                        key: `attr_${group.slug}_${slug}`,
                        label: `${group.name}: ${valueObj.value}`,
                        onRemove: () => handleAttributeToggle(group.slug, slug),
                    });
                }
            });
        });

        // Color chips
        selectedColors.forEach((color) => {
            chips.push({
                key: `color_${color}`,
                label: `Colour: ${color}`,
                onRemove: () => handleColorToggle(color),
            });
        });

        // Size chips
        selectedSizes.forEach((size) => {
            chips.push({
                key: `size_${size}`,
                label: `Size: ${size}`,
                onRemove: () => handleSizeToggle(size),
            });
        });

        return chips;
    }, [selectedAttributes, selectedColors, selectedSizes, availableAttributes]);

    const resetFilters = () => {
        setPriceMin('');
        setPriceMax('');
        setSelectedColors([]);
        setSelectedSizes([]);
        setSort('featured');
        const resetAttrs = {};
        availableAttributes.forEach((g) => {
            resetAttrs[g.slug] = [];
        });
        setSelectedAttributes(resetAttrs);

        router.get(route('storefront.category', category.slug), {}, {
            preserveState: false,
        });
    };

    // ----- Collapsible section component -----
    const FilterSection = ({ sectionKey, title, children }) => {
        const isOpen = openSections[sectionKey] ?? true;
        return (
            <div className="border-b border-gray-200 dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => toggleSection(sectionKey)}
                    className="flex justify-between items-center w-full py-4 cursor-pointer font-medium text-sm text-gray-800 dark:text-gray-200"
                >
                    <span>{title}</span>
                    <ChevronDown
                        className={`w-4 h-4 text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                {isOpen && <div className="pb-4">{children}</div>}
            </div>
        );
    };

    return (
        <StorefrontLayout>
            <Head title={`${category.name} — Shop Apple`} />

            {/* Category Jumbotron Header */}
            <section className="bg-white dark:bg-surface-dark border-b border-line dark:border-gray-800 py-10 px-6 sm:px-12 text-center">
                <div className="max-w-3xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center space-x-1.5 text-[11px] text-subtle mb-4" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-brand transition-colors font-medium">Home</Link>
                        <span className="text-gray-300">›</span>
                        <span className="text-heading dark:text-white font-semibold">{category.name}</span>
                    </nav>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-heading dark:text-white tracking-tight">
                        {category.name}
                    </h1>
                    <p className="text-sm sm:text-base text-muted dark:text-subtle mt-4 leading-relaxed font-normal">
                        {category.description}
                    </p>
                </div>
            </section>

            {/* Box Pack / Gold Desire purchase-type tabs (§6) */}
            {showListingTabs && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
                    <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full border border-gray-200/60 dark:border-gray-700">
                        <button
                            onClick={() => setListingTab('box_pack')}
                            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                                listingTab === 'box_pack' ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-gray-800 dark:hover:text-white'
                            }`}
                        >
                            <Package className="w-3.5 h-3.5" /> Box Pack
                        </button>
                        <button
                            onClick={() => setListingTab('gold_desire')}
                            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                                listingTab === 'gold_desire' ? 'bg-gold text-white shadow-sm' : 'text-muted hover:text-gray-800 dark:hover:text-white'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Gold Desire
                        </button>
                    </div>
                    <p className="text-xs text-subtle mt-2">
                        {listingTab === 'box_pack'
                            ? 'New, sealed-box retail units.'
                            : 'Certified pre-owned / refurbished units with condition grading.'}
                    </p>
                </div>
            )}

            {/* Active Filter Chips Bar */}
            {activeChips.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {activeChips.map((chip) => (
                            <span
                                key={chip.key}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                            >
                                {chip.label}
                                <button
                                    type="button"
                                    onClick={chip.onRemove}
                                    className="text-subtle hover:text-body dark:hover:text-gray-200"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-blue-600 text-sm font-medium hover:underline ml-2"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* Main Shopping Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Desktop Sidebar Filters */}
                <aside className="lg:col-span-1 bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 h-fit font-sans">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Filters</span>
                        </div>
                        <button
                            onClick={resetFilters}
                            className="text-subtle hover:text-gray-900 dark:hover:text-white flex items-center space-x-1 text-[10px] font-bold uppercase"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                        </button>
                    </div>

                    {/* Dynamic Attribute Groups */}
                    {availableAttributes.map((group) => (
                        <FilterSection key={group.id} sectionKey={`attr_${group.slug}`} title={group.name}>
                            <div className="space-y-2.5">
                                {group.values.map((val) => {
                                    const isChecked = (selectedAttributes[group.slug] || []).includes(val.slug);
                                    return (
                                        <label
                                            key={val.id}
                                            className="flex items-center gap-2.5 cursor-pointer group/check"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleAttributeToggle(group.slug, val.slug)}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/check:text-gray-900 dark:group-hover/check:text-white transition-colors">
                                                {val.value}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    ))}

                    {/* Colour Filter */}
                    {availableColors.length > 0 && (
                        <FilterSection sectionKey="colour" title="Colour">
                            <div className="flex flex-wrap gap-2">
                                {availableColors.map((color) => {
                                    const isSelected = selectedColors.includes(color.name);
                                    return (
                                        <button
                                            key={color.id}
                                            onClick={() => handleColorToggle(color.name)}
                                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all ${
                                                isSelected
                                                    ? 'border-brand bg-brand-tint text-brand dark:bg-blue-950/40 dark:text-blue-300'
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-450 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span
                                                className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
                                                style={{ backgroundColor: color.hex_code }}
                                            />
                                            <span>{color.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    {/* Sizes Filter */}
                    {availableSizes.length > 0 && (
                        <FilterSection sectionKey="size" title="Capacity / Size">
                            <div className="grid grid-cols-2 gap-2">
                                {availableSizes.map((size) => {
                                    const isSelected = selectedSizes.includes(size.name);
                                    return (
                                        <button
                                            key={size.id}
                                            onClick={() => handleSizeToggle(size.name)}
                                            className={`text-center py-2 px-3 rounded-xl border text-[11px] font-semibold transition-all ${
                                                isSelected
                                                    ? 'border-brand bg-brand-tint text-brand dark:bg-blue-950/40 dark:text-blue-300'
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-450 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {size.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    {/* Price Range Filter */}
                    <FilterSection sectionKey="price" title="Price Range (ZAR)">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder="Min price"
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                                onBlur={applyFilters}
                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                            />
                            <input
                                type="number"
                                placeholder="Max price"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                                onBlur={applyFilters}
                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="w-full mt-3 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full py-2 transition-colors"
                        >
                            Apply Price
                        </button>
                    </FilterSection>
                </aside>

                {/* Products Grid and Sort Banner */}
                <div className="lg:col-span-3 space-y-6">
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
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No products match your filters</h3>
                            <p className="text-xs text-subtle mt-1">Try resetting or modifying the filters on the sidebar.</p>
                            <button
                                onClick={resetFilters}
                                className="mt-6 px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {displayedProducts.map((prod) => {
                                // Extract unique colors
                                const prodColors = [];
                                const colorHexes = {};
                                prod.variants.forEach((v) => {
                                    if (v.color && !prodColors.includes(v.color.name)) {
                                        prodColors.push(v.color.name);
                                        colorHexes[v.color.name] = v.color.hex_code;
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
                                            {/* Listing-type badge (visible in mixed views) */}
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
            </div>
        </StorefrontLayout>
    );
}
