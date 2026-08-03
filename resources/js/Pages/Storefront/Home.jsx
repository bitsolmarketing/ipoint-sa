import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import ScrollReveal from '@/Components/ScrollReveal';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    CheckCircle,
    BadgeCheck,
    Truck,
    Lock,
    ShieldCheck,
    Headphones,
} from 'lucide-react';

// Trust badges shown in the "Buy with Confidence" disclaimer block
const TRUST_BADGES = [
    { icon: BadgeCheck, label: 'Genuine Products' },
    { icon: Truck, label: 'Nationwide Delivery' },
    { icon: Lock, label: 'Secure Payments' },
    { icon: ShieldCheck, label: 'Warranty Support' },
    { icon: Headphones, label: 'Dedicated Customer Support' },
];

// Full-width promotional banner strip (admin-managed via Banner positions).
// Renders nothing when there is no active banner for the slot.
function PromoStrip({ banner }) {
    if (!banner) return null;
    const Wrapper = banner.link_url ? Link : 'div';
    return (
        <ScrollReveal>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                <Wrapper
                    href={banner.link_url || undefined}
                    className="block relative rounded-3xl overflow-hidden group border border-gray-150 dark:border-gray-800"
                >
                    <img
                        src={banner.image_path}
                        alt={banner.title || 'Promotion'}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                </Wrapper>
            </section>
        </ScrollReveal>
    );
}

export default function Home({
    heroBanners = [],
    featuredProducts = [],
    offers = [],
    offersSection = null,
    categoryTabs = [],
    promoBannerPrimary = null,
    promoBannerSecondary = null,
    accessories = [],
}) {
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    // Default to iPhone (like the reference design); fall back to the first tab.
    const [activeTab, setActiveTab] = useState(
        categoryTabs.find((tab) => tab.slug === 'iphone')?.slug ?? categoryTabs[0]?.slug ?? ''
    );

    // Auto-rotate hero slider
    useEffect(() => {
        if (heroBanners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentHeroSlide((prev) => (prev + 1) % heroBanners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroBanners]);

    const prevSlide = () => {
        setCurrentHeroSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
    };

    const nextSlide = () => {
        setCurrentHeroSlide((prev) => (prev + 1) % heroBanners.length);
    };

    // Horizontal carousel scroll controls
    const offersRef = useRef(null);
    const accessoriesRef = useRef(null);
    const scrollRow = (ref, dir) => {
        if (ref.current) {
            ref.current.scrollBy({ left: dir * 360, behavior: 'smooth' });
        }
    };

    // Products for the currently selected category pill
    const activeProducts = categoryTabs.find((tab) => tab.slug === activeTab)?.products ?? [];

    // "(Cosmic Orange, 256GB)" style label from the product's first variant
    const variantLabel = (prod) => {
        const variant = prod.variants?.[0];
        if (!variant) return null;
        const parts = [variant.color?.name, variant.size?.name].filter(Boolean);
        return parts.length ? parts.join(', ') : null;
    };

    return (
        <StorefrontLayout>
            <Head title="Apple Premium Partner" />

            {/* ============================================================
                1. HERO SLIDESHOW — full-bleed Mercantile-style slideshow
               ============================================================ */}
            {heroBanners.length > 0 && (
                <section className="relative w-full h-[46vw] min-h-[260px] max-h-[600px] bg-white dark:bg-black overflow-hidden group">
                    {heroBanners.map((slide, index) => {
                        const SlideTag = slide.link_url ? Link : 'div';
                        return (
                            <SlideTag
                                key={slide.id}
                                href={slide.link_url || undefined}
                                className={`absolute inset-0 block transition-opacity duration-[900ms] ease-in-out ${
                                    index === currentHeroSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                {/* Promo text is baked into the banner image */}
                                <img
                                    src={slide.image_path}
                                    alt={slide.title || 'Promotion'}
                                    className="w-full h-full object-cover"
                                />
                            </SlideTag>
                        );
                    })}

                    {heroBanners.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                aria-label="Previous slide"
                                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                aria-label="Next slide"
                                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center">
                                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-sm">
                                    {heroBanners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentHeroSlide(index)}
                                            aria-label={`Go to slide ${index + 1}`}
                                            className={`h-2 rounded-full transition-all ${
                                                index === currentHeroSlide ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* ============================================================
                2. LATEST OFFERS — admin-managed carousel
               ============================================================ */}
            {offers.length > 0 && offersSection?.is_enabled !== false && (
                <ScrollReveal>
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                {offersSection?.eyebrow && (
                                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{offersSection.eyebrow}</span>
                                )}
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-1">
                                    {offersSection?.heading || 'Latest offers.'}
                                </h2>
                                {offersSection?.subheading && (
                                    <p className="text-xs text-muted dark:text-subtle mt-1.5 max-w-lg">{offersSection.subheading}</p>
                                )}
                            </div>
                            <div className="hidden sm:flex items-center space-x-2">
                                <button onClick={() => scrollRow(offersRef, -1)} aria-label="Scroll offers left" className="p-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => scrollRow(offersRef, 1)} aria-label="Scroll offers right" className="p-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div ref={offersRef} className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {offers.map((offer) => (
                                <Link
                                    key={offer.id}
                                    href={offer.link_url || '#'}
                                    className="flex-shrink-0 w-[300px] sm:w-[340px] group"
                                >
                                    <div className="relative h-52 sm:h-60 rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-150 dark:border-gray-800">
                                        <img
                                            src={offer.image_path}
                                            alt={offer.title || 'Offer'}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {offer.badge_text && (
                                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-heading text-[10px] font-extrabold shadow-sm">
                                                {offer.badge_text}
                                            </span>
                                        )}

                                        {/* "none" means the promo text is already baked into the artwork */}
                                        {offer.overlay_style !== 'none' && (offer.title || offer.subtitle) && (
                                            <>
                                                {offer.overlay_style === 'solid' ? (
                                                    <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-black/70 backdrop-blur-sm" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                                    {offer.title && (
                                                        <h3 className="text-base font-extrabold text-white leading-tight">{offer.title}</h3>
                                                    )}
                                                    {offer.subtitle && (
                                                        <p className="text-[11px] text-white/80 mt-0.5 leading-snug">{offer.subtitle}</p>
                                                    )}
                                                    <span className="inline-flex items-center text-[11px] font-bold text-accent mt-1">
                                                        {offer.cta_label || 'Shop offer'} <ArrowRight className="w-3 h-3 ml-0.5" />
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </ScrollReveal>
            )}

            {/* ============================================================
                3. PRODUCT CATEGORIES — tabbed browser
               ============================================================ */}
            {categoryTabs.length > 0 && (
                <section className="bg-white dark:bg-surface-dark py-16 border-t border-b border-line dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <h2 className="text-3xl sm:text-4xl font-semibold text-center text-heading dark:text-white tracking-tight mb-12">
                            Product Categories
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8">

                            {/* Left: brand statement */}
                            <div className="lg:col-span-1">
                                <span className="block text-2xl font-extrabold tracking-tight text-heading dark:text-white mb-6">
                                    iPoint
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-extrabold leading-[1.15] tracking-tight">
                                    <span className="text-success">Effortless</span>
                                    <br />
                                    <span className="text-heading dark:text-white">Apple</span>
                                    <br />
                                    <span className="text-heading dark:text-white">Experience</span>
                                </h3>
                                <p className="text-sm text-muted dark:text-subtle mt-5 max-w-xs leading-relaxed">
                                    A Comprehensive Apple product lineup available at your fingertips!
                                </p>
                            </div>

                            {/* Right: category pills + product cards */}
                            <div className="lg:col-span-3">
                                <div className="flex flex-wrap gap-3 mb-10">
                                    {categoryTabs.map((tab) => {
                                        const isActive = tab.slug === activeTab;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.slug)}
                                                className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                                                    isActive
                                                        ? 'bg-success border-success text-white'
                                                        : 'bg-transparent border-success text-success hover:bg-success/10'
                                                }`}
                                            >
                                                {tab.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeProducts.map((prod) => (
                                        <Link
                                            key={prod.id}
                                            href={`/products/${prod.slug}`}
                                            className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-transparent"
                                        >
                                            <div className="relative h-52 w-full flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={prod.image_path}
                                                    alt={prod.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                                {/* "View Details" reveal on hover */}
                                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <span className="bg-line-soft/95 dark:bg-gray-800/95 text-heading dark:text-white text-sm font-medium px-6 py-2.5 rounded-md shadow-md">
                                                        View Details
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="border-t border-gray-200 dark:border-gray-800 mt-5 pt-5">
                                                <h4 className="text-base font-bold text-heading dark:text-white leading-snug">
                                                    {prod.name}
                                                </h4>
                                                {variantLabel(prod) && (
                                                    <p className="text-xs text-muted dark:text-subtle mt-1.5">
                                                        ({variantLabel(prod)})
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* View the full catalogue across every category */}
                                <div className="mt-10 flex justify-center lg:justify-start">
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-success text-white text-sm font-semibold hover:bg-success-hover transition-colors"
                                    >
                                        View All Products
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                4. PROMOTIONAL BANNER #1 — admin-managed (spotlight)
               ============================================================ */}
            <PromoStrip banner={promoBannerPrimary} />

            {/* ============================================================
                5. FEATURED APPLE PRODUCTS
               ============================================================ */}
            {featuredProducts.length > 0 && (
                <ScrollReveal>
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Handpicked</span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-1">
                                    Featured Apple products.
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {featuredProducts.map((prod) => (
                                <Link
                                    key={prod.id}
                                    href={`/products/${prod.slug}`}
                                    className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-transparent"
                                >
                                    <div className="relative h-44 w-full flex items-center justify-center overflow-hidden">
                                        <img
                                            src={prod.image_path}
                                            alt={prod.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <span className="bg-line-soft/95 dark:bg-gray-800/95 text-heading dark:text-white text-sm font-medium px-6 py-2.5 rounded-md shadow-md">
                                                View Details
                                            </span>
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-800 mt-5 pt-5">
                                        <h3 className="text-base font-bold text-heading dark:text-white leading-snug">{prod.name}</h3>
                                        <p className="text-sm font-extrabold text-heading dark:text-white mt-1">
                                            From R {parseFloat(prod.base_price).toLocaleString()}
                                        </p>
                                        {variantLabel(prod) && (
                                            <p className="text-xs text-muted dark:text-subtle mt-1.5">
                                                ({variantLabel(prod)})
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </ScrollReveal>
            )}

            {/* ============================================================
                6. PROMOTIONAL BANNER #2 — admin-managed (zigzag)
               ============================================================ */}
            <PromoStrip banner={promoBannerSecondary} />

            {/* ============================================================
                7. APPLE AUTHORIZED ACCESSORIES — genuine accessory shelf
               ============================================================ */}
            {accessories.length > 0 && (
                <ScrollReveal>
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Genuine & certified</span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-1">
                                    Apple authorized accessories.
                                </h2>
                            </div>
                            <div className="hidden sm:flex items-center space-x-2">
                                <button onClick={() => scrollRow(accessoriesRef, -1)} aria-label="Scroll accessories left" className="p-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => scrollRow(accessoriesRef, 1)} aria-label="Scroll accessories right" className="p-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div ref={accessoriesRef} className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {accessories.map((prod) => (
                                <Link
                                    key={prod.id}
                                    href={`/products/${prod.slug}`}
                                    className="flex-shrink-0 w-[240px] sm:w-[270px] bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-transparent"
                                >
                                    <div className="relative h-40 w-full flex items-center justify-center overflow-hidden">
                                        <img
                                            src={prod.image_path}
                                            alt={prod.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <span className="bg-line-soft/95 dark:bg-gray-800/95 text-heading dark:text-white text-sm font-medium px-5 py-2 rounded-md shadow-md">
                                                View Details
                                            </span>
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-800 mt-5 pt-5">
                                        {prod.is_new && (
                                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand">New</span>
                                        )}
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{prod.name}</h3>
                                        <p className="text-sm font-extrabold text-heading dark:text-white mt-1">
                                            From R {parseFloat(prod.base_price).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center sm:justify-start">
                            <Link
                                href="/category/accessories"
                                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-hover transition-colors"
                            >
                                Shop all accessories <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>
                </ScrollReveal>
            )}

            {/* ============================================================
                8. DISCLAIMER / TRUST — "Buy with Confidence"
               ============================================================ */}
            <ScrollReveal>
                <section className="bg-page dark:bg-black border-t border-line dark:border-gray-800">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 text-center">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Shop with peace of mind</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-1">
                            Buy with Confidence
                        </h2>
                        <p className="text-sm text-muted dark:text-subtle mt-4 max-w-2xl mx-auto leading-relaxed">
                            We offer genuine Apple products and premium accessories. Product availability, pricing, and
                            promotions are subject to change without prior notice. Images are for illustration purposes only.
                            Warranty coverage varies by product. Please review product details before placing your order.
                        </p>

                        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {TRUST_BADGES.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-5"
                                >
                                    <Icon className="w-6 h-6 text-success" />
                                    <span className="text-xs font-semibold text-heading dark:text-white text-center leading-snug">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* ============================================================
                9. NEWSLETTER SUBSCRIPTION
               ============================================================ */}
            <ScrollReveal>
                <section className="bg-white dark:bg-surface-dark border-t border-line dark:border-gray-800">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 text-center">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Stay in the loop</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-1">
                            Sign up and subscribe.
                        </h2>
                        <p className="text-xs sm:text-sm text-muted dark:text-subtle mt-3 max-w-lg mx-auto">
                            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                        </p>

                        {subscribed ? (
                            <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1E7E34] dark:text-[#A3F0C2] bg-[#EAFDF2] dark:bg-[#1E3A2B] border border-[#A3F0C2] dark:border-[#2D6A4F] px-5 py-3 rounded-full">
                                <CheckCircle className="w-4 h-4" /> You're subscribed. Thanks for joining!
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
                                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
                            >
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full flex-1 bg-page dark:bg-gray-800 border border-transparent focus:border-brand rounded-full px-5 py-3 text-sm text-heading dark:text-white placeholder-gray-400 focus:outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto whitespace-nowrap bg-brand hover:bg-brand-hover text-white text-sm font-bold px-7 py-3 rounded-full transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </section>
            </ScrollReveal>
        </StorefrontLayout>
    );
}
