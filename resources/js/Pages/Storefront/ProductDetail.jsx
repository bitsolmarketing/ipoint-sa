import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { ShieldCheck, Truck, RotateCcw, AlertTriangle, Check, ArrowRight, Star, Heart, MessageSquare, ChevronDown, ChevronUp, Store, MapPin, X, Smartphone, Scale, Sparkles, BatteryCharging } from 'lucide-react';

export default function ProductDetail({ product, relatedProducts }) {
    const { variants } = product;

    // Local states for pickup branch selector
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(() => localStorage.getItem('istore_pickup_branch') || '');
    const [postalCode, setPostalCode] = useState('');
    const [postalCodeSaved, setPostalCodeSaved] = useState('');
    const [isPostalInputOpen, setIsPostalInputOpen] = useState(false);

    const storeLocations = [
        { id: 1, name: 'Village Green Shopping Centre', city: 'Greenside, Johannesburg' },
        { id: 2, name: 'V&A Waterfront', city: 'Cape Town' },
        { id: 3, name: 'Gateway', city: 'Durban' },
        { id: 4, name: 'Canal Walk', city: 'Cape Town' },
        { id: 5, name: 'Menlyn Park', city: 'Pretoria' }
    ];

    const handleSelectStore = (storeName) => {
        setSelectedStore(storeName);
        localStorage.setItem('istore_pickup_branch', storeName);
        setIsStoreModalOpen(false);
        // Force header component to re-sync
        window.dispatchEvent(new Event('storage'));
    };

    // Extract unique colors and sizes from variants
    const colorsList = [];
    const sizesList = [];
    
    variants.forEach(v => {
        if (v.color && !colorsList.some(c => c.id === v.color.id)) {
            colorsList.push(v.color);
        }
        if (v.size && !sizesList.some(s => s.id === v.size.id)) {
            sizesList.push(v.size);
        }
    });

    // Default selection
    const [selectedColor, setSelectedColor] = useState(colorsList[0] || null);
    const [selectedSize, setSelectedSize] = useState(sizesList[0] || null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeImage, setActiveImage] = useState(product.image_path);
    const [connectivity, setConnectivity] = useState('Wi-Fi');
    const [appleCareSelected, setAppleCareSelected] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState('description');
    const [activeSpecsTab, setActiveSpecsTab] = useState('summary');

    const { data, setData, post, processing } = useForm({
        product_variant_id: '',
        quantity: 1
    });

    // Update variant selection based on color/size choices
    useEffect(() => {
        const match = variants.find(v => {
            const colorMatch = !selectedColor || (v.color_id === selectedColor.id);
            const sizeMatch = !selectedSize || (v.size_id === selectedSize.id);
            return colorMatch && sizeMatch;
        });

        setSelectedVariant(match || null);
        if (match) {
            setData('product_variant_id', match.id);
        } else {
            setData('product_variant_id', '');
        }
    }, [selectedColor, selectedSize, variants]);

    // Swap the displayed image to match the selected color, if that color has
    // a dedicated image. Falls back to whatever image is already showing
    // (the main product image or a gallery pick) when it doesn't.
    useEffect(() => {
        if (!selectedColor) return;

        const colorImage = (selectedVariant && selectedVariant.color_id === selectedColor.id && selectedVariant.image_path)
            ? selectedVariant.image_path
            : variants.find(v => v.color_id === selectedColor.id && v.image_path)?.image_path;

        if (colorImage) {
            setActiveImage(colorImage);
        }
    }, [selectedColor, selectedVariant]);

    // Calculate dynamic pricing
    const basePriceNum = parseFloat(product.base_price);
    const modifierNum = selectedVariant ? parseFloat(selectedVariant.price_modifier) : 0;
    const appleCareCost = appleCareSelected ? 2999 : 0;
    const finalPrice = basePriceNum + modifierNum + appleCareCost;

    const discountAmount = product.is_on_promo && product.original_price
        ? parseFloat(product.original_price) - basePriceNum
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (!selectedVariant) return;

        post(route('cart.add'), {
            preserveScroll: true
        });
    };

    const toggleAccordion = (section) => {
        setExpandedAccordion(expandedAccordion === section ? null : section);
    };

    const isGoldDesire = product.listing_type === 'gold_desire';

    const addToCompare = () => {
        router.post(route('compare.add'), { product_id: product.id }, { preserveScroll: true, preserveState: true });
    };

    return (
        <StorefrontLayout>
            <Head title={`${product.name} — Buy Apple`} />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-0">
                <nav className="flex items-center space-x-1.5 text-[11px] text-subtle" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-brand transition-colors font-medium">Home</Link>
                    <span className="text-gray-300">›</span>
                    {product.category && (
                        <>
                            <Link href={`/category/${product.category.slug}`} className="hover:text-brand transition-colors font-medium">
                                {product.category.name}
                            </Link>
                            <span className="text-gray-300">›</span>
                        </>
                    )}
                    <span className="text-heading dark:text-white font-semibold line-clamp-1">{product.name}</span>
                </nav>
            </div>

            {/* Main Details Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-16 font-sans">
                {/* Left Column: Premium Images Gallery & Promotional Banners */}
                <div className="space-y-8">
                    {/* Main Image Frame - Premium Sleek Design with swipe left/right navigation */}
                    <div 
                        className="bg-gradient-to-br from-page to-line-light dark:from-surface-dark dark:to-page-dark rounded-3xl p-12 h-96 sm:h-[520px] flex items-center justify-center overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] border-0 ring-1 ring-black/[0.03] dark:ring-white/[0.05] relative select-none cursor-grab active:cursor-grabbing group"
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            window.swipeStartX = touch.clientX;
                        }}
                        onTouchEnd={(e) => {
                            const touch = e.changedTouches[0];
                            const diffX = touch.clientX - window.swipeStartX;
                            const imgs = product.gallery_images || [product.image_path];
                            const currentIndex = imgs.indexOf(activeImage);
                            if (diffX > 50 && currentIndex > 0) {
                                // Swipe right -> show previous
                                setActiveImage(imgs[currentIndex - 1]);
                            } else if (diffX < -50 && currentIndex < imgs.length - 1) {
                                // Swipe left -> show next
                                setActiveImage(imgs[currentIndex + 1]);
                            }
                        }}
                        onMouseDown={(e) => {
                            window.dragStartX = e.clientX;
                            window.isDraggingImage = true;
                        }}
                        onMouseUp={(e) => {
                            if (!window.isDraggingImage) return;
                            window.isDraggingImage = false;
                            const diffX = e.clientX - window.dragStartX;
                            const imgs = product.gallery_images || [product.image_path];
                            const currentIndex = imgs.indexOf(activeImage);
                            if (diffX > 50 && currentIndex > 0) {
                                // Drag right -> show previous
                                setActiveImage(imgs[currentIndex - 1]);
                            } else if (diffX < -50 && currentIndex < imgs.length - 1) {
                                // Drag left -> show next
                                setActiveImage(imgs[currentIndex + 1]);
                            }
                        }}
                        onMouseLeave={() => {
                            window.isDraggingImage = false;
                        }}
                    >
                        {/* Navigation chevron indicators */}
                        {product.gallery_images && product.gallery_images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const idx = product.gallery_images.indexOf(activeImage);
                                        if (idx > 0) setActiveImage(product.gallery_images[idx - 1]);
                                    }}
                                    disabled={product.gallery_images.indexOf(activeImage) === 0}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-md text-gray-800 dark:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none z-10"
                                >
                                    &larr;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const idx = product.gallery_images.indexOf(activeImage);
                                        if (idx < product.gallery_images.length - 1) setActiveImage(product.gallery_images[idx + 1]);
                                    }}
                                    disabled={product.gallery_images.indexOf(activeImage) === product.gallery_images.length - 1}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-md text-gray-800 dark:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none z-10"
                                >
                                    &rarr;
                                </button>
                            </>
                        )}

                        <img 
                            src={activeImage} 
                            alt={product.name} 
                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.07)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] pointer-events-none"
                        />
                    </div>

                    {/* Gallery Thumbnails */}
                    {product.gallery_images && product.gallery_images.length > 1 && (
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            {product.gallery_images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-20 h-20 bg-white dark:bg-surface-dark border rounded-2xl flex items-center justify-center p-2.5 overflow-hidden transition-all ${
                                        activeImage === img 
                                            ? 'border-brand ring-2 ring-brand/20' 
                                            : 'border-gray-205 dark:border-gray-800 hover:border-gray-400'
                                    }`}
                                >
                                    <img src={img} alt={`${product.name} gallery ${index}`} className="max-h-full max-w-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Apple Style Creative Info-Graphics */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-page dark:bg-surface-dark p-6 rounded-2xl">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">Apple Pencil Pro</h4>
                            <p className="text-[10px] text-subtle">Fits perfectly and handles with pixel-perfect precision.</p>
                            <img src="/uploads/categories/ipad.png" className="w-16 h-16 object-contain mt-3 mx-auto" />
                        </div>
                        <div className="bg-page dark:bg-surface-dark p-6 rounded-2xl">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">Magic Keyboard</h4>
                            <p className="text-[10px] text-subtle">Super thin design with back-lit keys & comfortable typing.</p>
                            <img src="/uploads/categories/mac.png" className="w-16 h-16 object-contain mt-3 mx-auto" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Options Configurator */}
                <div className="space-y-8">
                    <div>
                        {isGoldDesire ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-gold tracking-widest">
                                <Sparkles className="w-3 h-3" /> Gold Desire · Certified Pre-Owned
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-brand tracking-widest">
                                Box Pack · {product.is_new ? 'New' : 'Sealed'}
                            </span>
                        )}
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1 mb-2">{product.name}</h1>
                        
                        <div className="flex items-center space-x-1.5 mt-1">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                ))}
                            </div>
                            <span className="text-[11px] text-brand hover:underline cursor-pointer font-medium">({product.reviews ? product.reviews.length : 0} client reviews)</span>
                        </div>
                    </div>

                    {/* Price Block */}
                    <div className="py-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                R {finalPrice.toLocaleString()}
                            </span>
                            {product.original_price && !selectedVariant?.price_modifier && (
                                <span className="text-lg line-through text-subtle">
                                    R {parseFloat(product.original_price).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-brand font-semibold mt-1 cursor-pointer hover:underline">Explore financing options ›</p>
                    </div>

                    {/* Gold Desire condition panel (§6) */}
                    {isGoldDesire && (
                        <div className="border border-gold/25 dark:border-gold/30 bg-gold/10 dark:bg-gold/10 rounded-3xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-gold dark:text-gold-light">
                                <Sparkles className="w-4 h-4" />
                                <h4 className="text-xs font-bold uppercase tracking-wider">Certified Pre-Owned Condition</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-white/70 dark:bg-black/20 rounded-2xl p-3">
                                    <p className="text-[9px] font-bold text-subtle uppercase">Condition grade</p>
                                    <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{product.condition_grade ? `Grade ${product.condition_grade}` : '—'}</p>
                                </div>
                                <div className="bg-white/70 dark:bg-black/20 rounded-2xl p-3">
                                    <p className="text-[9px] font-bold text-subtle uppercase flex items-center gap-1"><BatteryCharging className="w-3 h-3" /> Battery health</p>
                                    <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{product.battery_health ? `${product.battery_health}%` : '—'}</p>
                                </div>
                            </div>
                            {product.cosmetic_notes && (
                                <p className="text-[11px] text-body dark:text-gray-300 leading-relaxed">{product.cosmetic_notes}</p>
                            )}
                        </div>
                    )}

                    {/* Color Picker */}
                    {colorsList.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-subtle uppercase tracking-widest mb-3">Color: <span className="text-gray-900 dark:text-white">{selectedColor?.name}</span></h3>
                            <div className="flex space-x-3.5">
                                {colorsList.map((color) => {
                                    const isSelected = selectedColor?.id === color.id;
                                    return (
                                        <button
                                            key={color.id}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-9 h-9 rounded-full border flex items-center justify-center p-0.5 transition-all ${
                                                isSelected 
                                                    ? 'border-gray-900 dark:border-white ring-2 ring-gray-900/10 dark:ring-white/20' 
                                                    : 'border-transparent hover:scale-105'
                                            }`}
                                        >
                                            <span 
                                                className="w-full h-full rounded-full border border-black/10 flex items-center justify-center"
                                                style={{ backgroundColor: color.hex_code }}
                                            >
                                                {isSelected && (
                                                    <Check className={`w-3.5 h-3.5 ${
                                                        color.hex_code.toLowerCase() === '#ffffff' || color.hex_code.toLowerCase() === '#f0ebe6'
                                                            ? 'text-gray-850' 
                                                            : 'text-white'
                                                    }`} />
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Capacity Picker */}
                    {sizesList.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-405 uppercase tracking-widest">Capacity</h3>
                                <span className="text-[10px] text-brand hover:underline cursor-pointer">Which size is right?</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {sizesList.map((size) => {
                                    const isSelected = selectedSize?.id === size.id;
                                    const varForSize = variants.find(v => {
                                        const colorMatch = !selectedColor || (v.color_id === selectedColor.id);
                                        return colorMatch && v.size_id === size.id;
                                    });
                                    const priceForSize = varForSize 
                                        ? parseFloat(product.base_price) + parseFloat(varForSize.price_modifier)
                                        : null;

                                    return (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            disabled={!varForSize}
                                            className={`border rounded-2xl p-4 flex justify-between items-center text-left transition-all ${
                                                !varForSize 
                                                    ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50' 
                                                    : isSelected 
                                                        ? 'border-brand bg-brand-tint/30 text-brand dark:bg-blue-950/20 dark:text-blue-300 ring-2 ring-brand/20' 
                                                        : 'border-gray-200 hover:border-gray-450 bg-white dark:bg-transparent text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            <span className="text-xs font-bold">{size.name}</span>
                                            {priceForSize && (
                                                <span className="text-xs font-bold">
                                                    R {priceForSize.toLocaleString()}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Connectivity Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-gray-405 uppercase tracking-widest">Connectivity</h3>
                            <span className="text-[10px] text-brand hover:underline cursor-pointer font-medium">Which model?</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Wi-Fi', 'Wi-Fi + Cellular'].map((conn) => (
                                <button
                                    key={conn}
                                    type="button"
                                    onClick={() => setConnectivity(conn)}
                                    className={`border rounded-2xl p-4 flex justify-between items-center text-left text-xs font-bold transition-all ${
                                        connectivity === conn
                                            ? 'border-brand bg-brand-tint/30 text-brand dark:bg-blue-950/20 dark:text-blue-300 ring-2 ring-brand/20'
                                            : 'border-gray-202 hover:border-gray-450 bg-white dark:bg-transparent text-gray-900 dark:text-white'
                                    }`}
                                >
                                    <span>{conn}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AppleCare+ Insurance Module */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-5 bg-gray-50/50 dark:bg-gray-900/10">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <img src="/uploads/categories/airtag.png" className="w-8 h-8 object-contain" />
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">AppleCare+ for {product.name}</h4>
                                    <p className="text-[10px] text-subtle mt-0.5">Protect against drops, spills & hardware failures.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAppleCareSelected(!appleCareSelected)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                                    appleCareSelected
                                        ? 'bg-brand text-white border-transparent'
                                        : 'border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {appleCareSelected ? 'Added' : 'Add'}
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-850">
                            <span className="text-[10px] text-subtle">Total AppleCare+ cover</span>
                            <span className="text-xs font-extrabold text-gray-950 dark:text-white">R 2 999</span>
                        </div>
                    </div>

                    {/* Get it fast section */}
                    <div className="bg-page dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-5 md:p-6 space-y-4 font-sans text-xs">
                        <h4 className="font-bold text-heading dark:text-white text-sm">Get it fast</h4>
                        
                        {/* Pickup option */}
                        <div className="space-y-1">
                            <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
                                <Store className="w-4 h-4 text-subtle" />
                                <span>Pickup</span>
                            </p>
                            <button 
                                onClick={() => setIsStoreModalOpen(true)}
                                className="text-xs font-semibold text-brand hover:underline flex items-center"
                            >
                                {selectedStore ? `${selectedStore} ` : 'Select a Store '} &gt;
                            </button>
                        </div>

                        {/* Shipping option */}
                        <div className="space-y-1 pt-1.5 border-t border-gray-200/50 dark:border-gray-800/80">
                            <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
                                <Truck className="w-4 h-4 text-subtle" />
                                <span>Shipping</span>
                            </p>
                            {isPostalInputOpen ? (
                                <div className="flex items-center space-x-2 mt-1">
                                    <input 
                                        type="text" 
                                        value={postalCode} 
                                        onChange={(e) => setPostalCode(e.target.value)} 
                                        placeholder="e.g. 2000" 
                                        className="border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-[11px] bg-white dark:bg-gray-850 w-24 text-heading dark:text-white focus:outline-none" 
                                    />
                                    <button 
                                        onClick={() => {
                                            if (postalCode.trim()) {
                                                setPostalCodeSaved(postalCode);
                                                setIsPostalInputOpen(false);
                                            }
                                        }}
                                        className="bg-brand text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsPostalInputOpen(true)}
                                    className="text-xs font-semibold text-brand hover:underline flex items-center"
                                >
                                    {postalCodeSaved ? `Postal Code: ${postalCodeSaved} ` : 'Enter your postal code '} &gt;
                                </button>
                            )}
                        </div>
                    </div>

                    {/* A. Select Pickup Store Modal */}
                    {isStoreModalOpen && (
                        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsStoreModalOpen(false)} />
                            <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-gray-155 dark:border-gray-800 rounded-3xl p-6 relative z-10 shadow-2xl font-sans text-xs">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                                        <Store className="w-4 h-4 text-brand" />
                                        <span>Select a Pickup Store</span>
                                    </h3>
                                    <button onClick={() => setIsStoreModalOpen(false)} className="p-1 text-subtle hover:text-body dark:hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="py-4 space-y-2">
                                    {storeLocations.map((store) => (
                                        <button
                                            key={store.id}
                                            onClick={() => handleSelectStore(store.name)}
                                            className={`w-full text-left p-3.5 rounded-2xl border text-xs flex justify-between items-center transition-all ${
                                                selectedStore === store.name
                                                    ? 'border-brand bg-brand-tint dark:bg-blue-950/20 text-brand font-bold'
                                                    : 'border-gray-150 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-850 dark:text-gray-300'
                                            }`}
                                        >
                                            <div>
                                                <p className="font-bold">{store.name}</p>
                                                <p className="text-[9px] text-gray-450 mt-0.5">{store.city}, South Africa</p>
                                            </div>
                                            <MapPin className="w-3.5 h-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart CTA */}
                    <div className="space-y-3">
                        <form onSubmit={handleAddToCart}>
                            <button
                                type="submit"
                                disabled={processing || !selectedVariant || selectedVariant.stock <= 0}
                                className={`w-full py-4 text-xs font-semibold text-center rounded-full transition-all duration-300 ${
                                    !selectedVariant || selectedVariant.stock <= 0
                                        ? 'bg-gray-150 text-gray-450 dark:bg-gray-800 dark:text-body cursor-not-allowed'
                                        : 'bg-brand hover:bg-brand-hover text-white hover:scale-[1.01] hover:shadow-lg'
                                    }`}
                            >
                                {processing 
                                    ? 'Adding...' 
                                    : !selectedVariant 
                                        ? 'Select Options' 
                                        : selectedVariant.stock <= 0 
                                            ? 'Out of Stock' 
                                            : 'Add to Bag'}
                            </button>
                        </form>
                        
                        <Link
                            href="/checkout"
                            className="w-full text-center py-4 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-550 text-white block transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                        >
                            Checkout Now
                        </Link>

                        <button
                            type="button"
                            onClick={addToCompare}
                            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand hover:text-brand transition-colors"
                        >
                            <Scale className="w-4 h-4" /> Add to Compare
                        </button>
                    </div>
                </div>
            </div>

            {/* Cross-Sell: Frequently bought together section */}
            <section className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 py-16 px-4 sm:px-6 md:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-heading dark:text-white tracking-tight mb-8">
                        Frequently bought together.
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-left">
                        {[
                            { name: 'Apple AirPods Pro 2', price: 'R4 999', img: '/uploads/categories/airpods.png' },
                            { name: 'iStore Leather Case', price: 'R799', img: '/uploads/categories/accessories.png' },
                            { name: 'Glass Screen Guard', price: 'R399', img: '/uploads/categories/airtag.png' },
                            { name: 'Apple Pencil Pro', price: 'R2 499', img: '/uploads/categories/ipad.png' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-page dark:bg-surface-dark-alt p-6 rounded-3xl flex flex-col justify-between items-center text-center">
                                <img src={item.img} className="w-16 h-16 object-contain mb-4" />
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.name}</h4>
                                <span className="text-[11px] text-muted font-extrabold">{item.price}</span>
                                <button className="mt-4 px-4 py-1.5 border border-gray-200 hover:bg-brand hover:text-white text-[10px] font-bold rounded-full transition-colors">Add to setup</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Accordions Details: description, warranty, delivery specs */}
            <section className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 py-12 px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Description Accordion */}
                    <div className="border-b border-gray-200 dark:border-gray-850 pb-4">
                        <button 
                            onClick={() => toggleAccordion('description')} 
                            className="w-full flex justify-between items-center py-2 text-left font-bold text-sm text-gray-900 dark:text-white"
                        >
                            <span>Product Description</span>
                            {expandedAccordion === 'description' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedAccordion === 'description' && (
                            <div className="pt-2 text-xs text-muted leading-relaxed dark:text-subtle">
                                {product.description}
                            </div>
                        )}
                    </div>

                    {/* Technical Specifications Accordion */}
                    <div className="border-b border-gray-200 dark:border-gray-850 pb-4">
                        <button 
                            onClick={() => toggleAccordion('specs')} 
                            className="w-full flex justify-between items-center py-2 text-left font-bold text-sm text-gray-900 dark:text-white"
                        >
                            <span>Technical Specifications</span>
                            {expandedAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedAccordion === 'specs' && (
                            <div className="pt-2 text-xs text-muted leading-relaxed dark:text-subtle">
                                <ul className="space-y-1.5 list-disc pl-5">
                                    <li>M-Series supercharged custom silicon architecture</li>
                                    <li>Tandem OLED Ultra Retina display support</li>
                                    <li>Precision engineered aluminum housing</li>
                                    <li>Next-gen Thunderbolt / USB 4 expansion support</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Shipping & Returns Accordion */}
                    <div className="border-b border-gray-200 dark:border-gray-850 pb-4">
                        <button 
                            onClick={() => toggleAccordion('shipping')} 
                            className="w-full flex justify-between items-center py-2 text-left font-bold text-sm text-gray-900 dark:text-white"
                        >
                            <span>Fulfillment & Returns</span>
                            {expandedAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedAccordion === 'shipping' && (
                            <div className="pt-2 text-xs text-muted leading-relaxed dark:text-subtle">
                                Standard shipping takes 1-3 business days. Free returns are supported within 7 days of package delivery.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Specifications Tab (Summary vs Technical Specs) */}
            <section className="bg-white dark:bg-surface-dark py-16 px-4 sm:px-6 md:px-8 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-4xl mx-auto space-y-8 font-sans">
                    {/* Tab Switcher Pills */}
                    <div className="flex justify-center">
                        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full border border-gray-200/50 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setActiveSpecsTab('summary')}
                                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                    activeSpecsTab === 'summary'
                                        ? 'bg-success-hover text-white shadow-sm'
                                        : 'text-muted hover:text-gray-700 dark:hover:text-white'
                                }`}
                            >
                                Summary
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSpecsTab('technical')}
                                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                    activeSpecsTab === 'technical'
                                        ? 'bg-success-hover text-white shadow-sm'
                                        : 'text-muted hover:text-gray-700 dark:hover:text-white'
                                }`}
                            >
                                Technical Specifications
                            </button>
                        </div>
                    </div>

                    {/* Tab Content Display Area */}
                    {activeSpecsTab === 'summary' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
                            {(product.summary_specs || [
                                { label: 'Screen Size', value: '6.1 inches', icon: 'smartphone' },
                                { label: 'Network', value: '5G Capable', icon: 'wifi' },
                                { label: 'Main Camera', value: '48MP Main', icon: 'camera' },
                                { label: 'Battery', value: '11-low 3274 mAh', icon: 'battery' }
                            ]).map((item, index) => (
                                <div key={index} className="flex flex-col items-center text-center p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center mb-3">
                                        {item.icon === 'battery' ? <ShieldCheck className="w-5 h-5 text-subtle" /> : <Smartphone className="w-5 h-5 text-subtle" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-subtle uppercase tracking-wide">{item.label}</span>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white mt-1">{item.value || 'Not Configured'}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm pt-2 bg-white dark:bg-gray-900">
                            <table className="w-full text-left border-collapse text-xs">
                                <tbody>
                                    {(product.technical_specs || [
                                        { spec_key: 'Build', spec_val: 'Titanium design, Ceramic Shield front, textured matte glass back' },
                                        { spec_key: 'OS', spec_val: 'iOS 17' },
                                        { spec_key: 'CPU', spec_val: 'A17 Pro chip, 6-core CPU' },
                                        { spec_key: 'USB', spec_val: 'USB-C connector with support for USB 3' }
                                    ]).map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                            <td className="py-4 px-6 font-bold text-muted uppercase tracking-wider w-1/3 border-r border-gray-100 dark:border-gray-850 bg-gray-50/40 dark:bg-gray-900/40">
                                                {item.spec_key}
                                            </td>
                                            <td className="py-4 px-6 text-gray-900 dark:text-white font-normal leading-relaxed">
                                                {item.spec_val || 'Not Configured'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 py-16 px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="border-b border-gray-150 dark:border-gray-800 pb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Customer Reviews</h3>
                            <p className="text-xs text-subtle mt-1">Real feedback left by verified buyers.</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center space-x-1 justify-end">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    {product.reviews && product.reviews.length > 0
                                        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
                                        : '5.0'
                                    }
                                </span>
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-[10px] text-subtle mt-0.5 block">{product.reviews ? product.reviews.length : 0} reviews</span>
                        </div>
                    </div>

                    {/* Review Submission Form */}
                    <div className="bg-gray-50/50 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-1 tracking-wider">Leave a Review</h4>
                        <p className="text-[10px] text-subtle mb-4">Reviews are checked by our team before they’re published.</p>
                        <ReviewForm productId={product.id} />
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((rev) => (
                                <div key={rev.id} className="border-b border-gray-100 dark:border-gray-850 pb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{rev.reviewer_name}</p>
                                            <p className="text-[10px] text-subtle mt-0.5">
                                                {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex text-amber-400">
                                            {[...Array(rev.rating)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-body dark:text-subtle mt-3 leading-relaxed font-normal">
                                        {rev.comment}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-subtle text-center py-6">No reviews have been left for this product yet. Be the first to share your experience!</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Recently Viewed Products Deck */}
            {relatedProducts.length > 0 && (
                <section className="bg-page dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 py-16 px-4 sm:px-6 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
                            Recently viewed products.
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((prod) => (
                                <Link 
                                    key={prod.id} 
                                    href={`/products/${prod.slug}`}
                                    className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-[4px] p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                                >
                                    <div className="relative">
                                        {/* Product Image */}
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
                                        {/* Specifications Subtitle */}
                                        <p className="text-[11px] text-muted dark:text-subtle font-medium">
                                            (Standard Variant, 256GB)
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </StorefrontLayout>
    );
}

function ReviewForm({ productId }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        reviewer_name: '',
        rating: 5,
        comment: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('storefront.product.reviews.store', productId), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Your Name</label>
                    <input 
                        type="text" 
                        value={data.reviewer_name}
                        onChange={(e) => setData('reviewer_name', e.target.value)}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-850 text-gray-900 dark:text-white"
                        placeholder="e.g. John Doe"
                        required
                    />
                    {errors.reviewer_name && <p className="text-sale text-[10px] mt-1">{errors.reviewer_name}</p>}
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Rating stars</label>
                    <select 
                        value={data.rating}
                        onChange={(e) => setData('rating', parseInt(e.target.value))}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-850 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                        <option value="3">⭐⭐⭐ 3 Stars</option>
                        <option value="2">⭐⭐ 2 Stars</option>
                        <option value="1">⭐ 1 Star</option>
                    </select>
                    {errors.rating && <p className="text-sale text-[10px] mt-1">{errors.rating}</p>}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Comments</label>
                <textarea 
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    rows="3"
                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-855 text-gray-900 dark:text-white"
                    placeholder="Tell us what you like or dislike about this product."
                    required
                ></textarea>
                {errors.comment && <p className="text-sale text-[10px] mt-1">{errors.comment}</p>}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2 bg-brand hover:bg-brand-hover text-white font-semibold rounded-full disabled:opacity-50"
                >
                    {processing ? 'Submitting...' : 'Post Review'}
                </button>
            </div>
        </form>
    );
}
