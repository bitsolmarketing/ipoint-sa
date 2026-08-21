import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import { Search, ShoppingBag, User, X, Menu, Settings, LogOut, Store, Truck, MapPin, ShieldCheck, Clock, XCircle, Wrench, Scale } from 'lucide-react';
import CartDrawer from './CartDrawer';
import ThemeToggle from './ThemeToggle';
import { themeColor } from '@/theme';

// Apple glyph as an inline SVG — the  private-use character does not render off Apple devices.
const AppleIcon = (props) => (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

// Primary brand logo — a two-tone iPoint wordmark (white "i", blue "Point").
const IPointLogo = ({ className = '' }) => (
    <span className={`inline-flex items-baseline font-extrabold tracking-tight leading-none ${className}`}>
        <span className="text-white">i</span>
        <span className="text-brand">Point</span>
    </span>
);

// Apple "Authorised Reseller" badge lockup — Apple glyph + program name inside a bordered chip.
const AuthorisedResellerLogo = ({ className = '' }) => (
    <div className={`inline-flex items-center gap-2 rounded-lg border border-white/25 px-2.5 py-1 ${className}`}>
        <AppleIcon className="w-4 h-4 text-white flex-shrink-0" />
        <span className="text-[9px] leading-[1.15] text-white/90 font-semibold uppercase tracking-wide">
            Authorised<br />Reseller
        </span>
    </div>
);

// Top-level menu — a single flat row of links, no dropdowns.
const MENU_ITEMS = [
    { label: 'iPhone', href: '/category/iphone' },
    { label: 'iPad', href: '/category/ipad' },
    { label: 'Mac', href: '/category/mac' },
    { label: 'Watch', href: '/category/watch' },
    { label: 'AirPods', href: '/category/airpods' },
    { label: 'Accessories', href: '/category/accessories' },
    { label: 'Services', href: '/services' },
];

// Live Order Tracking Map Component (shared with account portal)
function TrackingMap({ hereApiKey, city }) {
    const mapRef = useRef(null);
    const [mapError, setMapError] = useState(false);

    const getCoordinates = (cityName) => {
        const name = (cityName || '').toLowerCase();
        if (name.includes('cape town') || name.includes('bellville') || name.includes('somerset')) {
            return { lat: -33.9249, lng: 18.4241 };
        }
        if (name.includes('durban') || name.includes('umhlanga') || name.includes('pinetown')) {
            return { lat: -29.8587, lng: 31.0218 };
        }
        if (name.includes('pretoria') || name.includes('centurion')) {
            return { lat: -25.7479, lng: 28.2293 };
        }
        if (name.includes('port elizabeth') || name.includes('gqeberha')) {
            return { lat: -33.9608, lng: 25.6022 };
        }
        return { lat: -26.2041, lng: 28.0473 };
    };

    useEffect(() => {
        if (!hereApiKey || !window.H) {
            setMapError(true);
            return;
        }

        try {
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }

            const dispatchCoords = { lat: -26.1098, lng: 28.0526 };
            const destCoords = getCoordinates(city);

            const platform = new window.H.service.Platform({
                apikey: hereApiKey
            });

            const defaultLayers = platform.createDefaultLayers();

            const map = new window.H.Map(
                mapRef.current,
                defaultLayers.vector.normal.map,
                {
                    zoom: 6,
                    center: dispatchCoords,
                    pixelRatio: window.devicePixelRatio || 1
                }
            );

            new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
            window.H.ui.UI.createDefault(map, defaultLayers);

            const dispatchMarker = new window.H.map.Marker(dispatchCoords);
            const destinationMarker = new window.H.map.Marker(destCoords);
            map.addObjects([dispatchMarker, destinationMarker]);

            const lineString = new window.H.geo.LineString();
            lineString.pushPoint(dispatchCoords);
            lineString.pushPoint(destCoords);

            const routeLine = new window.H.map.Polyline(lineString, {
                // HERE takes a colour string, not a class, so pull the configured
                // primary out of the palette rather than hard-coding the blue.
                style: { strokeColor: themeColor('brand', '#0066CC'), lineWidth: 4 }
            });
            map.addObject(routeLine);

            map.getLookAtDataProvider().zoomTo(routeLine.getBoundingBox());

        } catch (e) {
            console.error('HERE Maps failed initialization:', e);
            setMapError(true);
        }
    }, [hereApiKey, city]);

    if (mapError || !hereApiKey || !window.H) {
        return (
            <div className="bg-gray-50 dark:bg-gray-850 rounded-2xl p-4 text-center space-y-3 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-[9px] font-bold text-subtle uppercase tracking-widest">
                    <span>Dispatch: Johannesburg</span>
                    <span className="text-brand">In Transit</span>
                    <span>Destination: {city || 'Your Address'}</span>
                </div>
                <div className="relative h-10 w-full bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-xl flex items-center px-4 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <div className="flex-grow border-t border-dashed border-brand/30 mx-2 relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-[45%] text-brand animate-bounce">
                            <Truck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-brand" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline text-[8px] font-bold text-subtle uppercase tracking-wider">
                <span>Dispatch: Johannesburg</span>
                <span className="text-brand animate-pulse">Live Shipment Tracking</span>
                <span>Destination: {city || 'Your Address'}</span>
            </div>
            <div ref={mapRef} className="h-44 w-full rounded-xl overflow-hidden border border-gray-150 dark:border-gray-800 bg-page" />
        </div>
    );
}

export default function Navigation() {
    const { categories, cart, auth, hereApiKey, compareCount = 0 } = usePage().props;
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Pickup & Live Tracking states
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(() => localStorage.getItem('istore_pickup_branch') || '');
    
    // Header Track Order Modal States
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackOrderId, setTrackOrderId] = useState('');
    const [trackOrderResult, setTrackOrderResult] = useState(null);
    const [trackingError, setTrackingError] = useState(null);
    const [isFetchingTrack, setIsFetchingTrack] = useState(false);

    // Live Search states (Inline search bar dropdown)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const searchRef = useRef(null);
    const profileRef = useRef(null);
    const { post } = useForm();

    const cartCount = Object.values(cart || {}).reduce((acc, item) => acc + item.quantity, 0);

    const storeLocations = [
        { id: 1, name: 'Sandton City', city: 'Johannesburg' },
        { id: 2, name: 'V&A Waterfront', city: 'Cape Town' },
        { id: 3, name: 'Gateway', city: 'Durban' },
        { id: 4, name: 'Canal Walk', city: 'Cape Town' },
        { id: 5, name: 'Menlyn Park', city: 'Pretoria' }
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsDropdownOpen(false);
            return;
        }

        setIsSearching(true);
        setIsDropdownOpen(true);
        const delayDebounceFn = setTimeout(() => {
            fetch(`/search?q=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(data => {
                    setSearchResults(data);
                    setIsSearching(false);
                })
                .catch(() => setIsSearching(false));
        }, 200);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const handleSelectStore = (storeName) => {
        setSelectedStore(storeName);
        localStorage.setItem('istore_pickup_branch', storeName);
        setIsStoreModalOpen(false);
    };

    const handleTrackOrder = (e) => {
        e.preventDefault();
        if (!trackOrderId.trim()) return;

        setIsFetchingTrack(true);
        setTrackingError(null);
        setTrackOrderResult(null);

        fetch(`/api/orders/track/${encodeURIComponent(trackOrderId.trim())}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Order not found.');
                }
                setTrackOrderResult(data);
                setIsFetchingTrack(false);
            })
            .catch((err) => {
                setTrackingError(err.message || 'Order reference not found.');
                setIsFetchingTrack(false);
            });
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'paid':
                return { color: 'bg-green-50 text-green-700 border-green-200', text: 'Paid & Processing', icon: ShieldCheck, step: 2 };
            case 'shipped':
                return { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Shipped (In Transit)', icon: Truck, step: 3 };
            case 'cancelled':
                return { color: 'bg-red-50 text-red-750 border-red-200', text: 'Cancelled', icon: XCircle, step: 0 };
            default:
                return { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Pending Payment', icon: Clock, step: 1 };
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 bg-black text-white font-sans">

                {/* Single black navigation bar */}
                <div className="max-w-[1700px] mx-auto h-[72px] px-4 sm:px-6 lg:px-8 flex items-center gap-4 lg:gap-5">

                    {/* Logo 1 — iPoint brand wordmark (links home) */}
                    <Link href="/" aria-label="iPoint home" className="flex-shrink-0">
                        <IPointLogo className="text-xl sm:text-2xl" />
                    </Link>

                    {/* Logo 2 — Apple Authorised Reseller badge */}
                    <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                        <span className="h-8 w-px bg-white/25" />
                        <AuthorisedResellerLogo />
                    </div>

                    {/* Main menu — flat links, no dropdowns */}
                    <nav className="hidden lg:flex items-center gap-3 xl:gap-5 flex-1 justify-center text-[13px] font-medium">
                        {MENU_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-white/90 hover:text-white transition-colors whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: search, account, cart */}
                    <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 flex-shrink-0">

                        {/* Track Order — prominent green CTA (styled like the Locate Reseller button) */}
                        <a
                            href="https://www.postnet.co.za/tracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden lg:inline-flex items-center gap-2 bg-success hover:bg-success-hover text-white text-[13px] font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap focus:outline-none"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Track Order</span>
                        </a>

                        {/* Light/dark mode */}
                        <ThemeToggle className="text-white hover:bg-white/10" />

                        {/* Search toggle */}
                        <button
                            onClick={() => setIsSearchOpen((open) => !open)}
                            aria-label="Search"
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors focus:outline-none"
                        >
                            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                        </button>

                        {/* Account portal */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                aria-label="Account"
                                className="p-2 rounded-full hover:bg-white/10 text-white focus:outline-none transition-colors"
                            >
                                <User className="w-5 h-5" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl z-55 py-2 text-heading dark:text-white">
                                    {auth.user ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-850">
                                                <p className="text-[10px] text-subtle font-bold uppercase">Signed in as</p>
                                                <p className="text-xs font-bold text-gray-800 dark:text-white truncate mt-0.5">{auth.user.name}</p>
                                            </div>

                                            {auth.user.is_admin && (
                                                <Link
                                                    href={route('admin.dashboard')}
                                                    className="px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 flex items-center space-x-2.5 text-gray-700 dark:text-gray-200 font-semibold"
                                                >
                                                    <Settings className="w-4 h-4 text-subtle" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}

                                            <Link
                                                href={route('profile.edit')}
                                                className="px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 flex items-center space-x-2.5 text-gray-700 dark:text-gray-200 font-semibold"
                                            >
                                                <User className="w-4 h-4 text-subtle" />
                                                <span>My Account / Portal</span>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 block text-gray-800 dark:text-gray-200 font-bold"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 block text-gray-800 dark:text-gray-200 font-bold"
                                            >
                                                Create Account
                                            </Link>
                                        </>
                                    )}

                                    {/* Utilities kept accessible from the account menu */}
                                    <div className="border-t border-gray-100 dark:border-gray-850 mt-1 pt-1">
                                        <button
                                            onClick={() => { setIsProfileOpen(false); setIsStoreModalOpen(true); }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 flex items-center space-x-2.5 text-gray-700 dark:text-gray-200 font-semibold"
                                        >
                                            <Store className="w-4 h-4 text-subtle" />
                                            <span>Pickup: {selectedStore || 'Select Store'}</span>
                                        </button>
                                        <a
                                            href="https://www.postnet.co.za/tracker"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 flex items-center space-x-2.5 text-gray-700 dark:text-gray-200 font-semibold"
                                        >
                                            <Truck className="w-4 h-4 text-subtle" />
                                            <span>Track Order</span>
                                        </a>
                                        <Link
                                            href="/apple-product-repair"
                                            className="px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 flex items-center space-x-2.5 text-gray-700 dark:text-gray-200 font-semibold"
                                        >
                                            <Wrench className="w-4 h-4 text-subtle" />
                                            <span>Book a Repair</span>
                                        </Link>
                                    </div>

                                    {auth.user && (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-855 flex items-center space-x-2.5 text-sale border-t border-gray-100 dark:border-gray-855 mt-1 font-bold"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Log Out</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart Trigger */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            aria-label="Cart"
                            className="p-2 rounded-full hover:bg-white/10 text-white relative focus:outline-none transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-success text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Menu"
                            className="lg:hidden p-2 rounded-full hover:bg-white/10 text-white focus:outline-none"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Expanding search panel */}
                {isSearchOpen && (
                    <div className="border-t border-white/10 bg-black" ref={searchRef}>
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 relative">
                            <div className="w-full flex items-center bg-white/10 rounded-full px-4 py-2.5">
                                <Search className="w-4 h-4 text-white/60 mr-2 flex-shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products"
                                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-white placeholder-white/50 p-0"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                        className="p-0.5 rounded-full hover:bg-white/10 text-white/60"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute left-4 right-4 sm:left-6 sm:right-6 top-full bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl z-55 max-h-80 overflow-y-auto p-4 space-y-3">
                                    {isSearching ? (
                                        <p className="text-[10px] text-subtle animate-pulse font-semibold">Searching catalog...</p>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((prod) => (
                                            <Link
                                                key={prod.id}
                                                href={`/products/${prod.slug}`}
                                                onClick={() => { setIsDropdownOpen(false); setIsSearchOpen(false); }}
                                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
                                            >
                                                <img src={prod.image_path} alt={prod.name} className="w-8 h-8 object-contain bg-white p-0.5 border border-gray-100 rounded-lg flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{prod.name}</p>
                                                    <p className="text-[9px] text-brand font-semibold">R {parseFloat(prod.base_price).toLocaleString()}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-subtle py-2">No matching products found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </header>

            {/* Mobile Categories Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[72px] z-35 bg-black/95 text-white lg:hidden py-8 px-6 font-sans flex flex-col justify-between overflow-y-auto">
                    <div className="space-y-6">
                        <div className="flex items-center bg-gray-900 rounded-xl px-3.5 py-2">
                            <Search className="w-4 h-4 text-subtle mr-2" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search iPoint"
                                className="w-full bg-transparent border-none text-xs text-white placeholder-gray-500 focus:ring-0 focus:outline-none p-0"
                            />
                        </div>

                        {categories && categories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                href={`/category/${cat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-base font-semibold border-b border-white/10 pb-2.5 text-gray-300 hover:text-white"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-6 space-y-4 text-xs font-semibold">
                        <Link href="/apple-product-repair" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 text-gray-300">
                            <Wrench className="w-4 h-4" />
                            <span>Book a Repair</span>
                        </Link>
                        <button onClick={() => { setIsMobileMenuOpen(false); setIsStoreModalOpen(true); }} className="flex items-center space-x-2 text-gray-300">
                            <Store className="w-4 h-4" />
                            <span>Pickup: {selectedStore || 'Select Store'}</span>
                        </button>
                        <a
                            href="https://www.postnet.co.za/tracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-2 text-gray-300"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Track Order</span>
                        </a>

                        {auth.user ? (
                            <button onClick={handleLogout} className="text-sale flex items-center space-x-2 border-t border-white/10 pt-4 w-full font-bold">
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <div className="flex space-x-4 border-t border-white/10 pt-4">
                                <Link href={route('login')} onClick={() => setIsMobileMenuOpen(false)} className="text-brand">Sign In</Link>
                                <Link href={route('register')} onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* A. Select Pickup Store Modal */}
            {isStoreModalOpen && (
                <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsStoreModalOpen(false)} />
                    <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 relative z-10 shadow-2xl font-sans">
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

            {/* B. Order Tracking Modal */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsTrackingModalOpen(false)} />
                    <div className="w-full max-w-lg bg-white dark:bg-surface-dark border border-gray-155 dark:border-gray-800 rounded-3xl p-6 relative z-10 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                                <Truck className="w-4 h-4 text-brand" />
                                <span>Order Tracking System</span>
                            </h3>
                            <button onClick={() => setIsTrackingModalOpen(false)} className="p-1 text-subtle hover:text-body dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input Form */}
                        <form onSubmit={handleTrackOrder} className="py-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1.5">Enter Order Reference Number</label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="text"
                                        value={trackOrderId}
                                        onChange={(e) => setTrackOrderId(e.target.value)}
                                        placeholder="e.g. 100001 or #IPT-100001"
                                        className="flex-1 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-xs text-heading dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isFetchingTrack}
                                        className="px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors"
                                    >
                                        {isFetchingTrack ? 'Searching...' : 'Track'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Error Alert */}
                        {trackingError && (
                            <div className="mb-4 bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-300 p-3.5 rounded-2xl text-[10px] font-bold border border-red-200 dark:border-transparent">
                                {trackingError}
                            </div>
                        )}

                        {/* Order Tracking Information Results */}
                        {trackOrderResult && (
                            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                {/* Order info header details */}
                                <div className="flex justify-between items-start text-xs bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl">
                                    <div>
                                        <p className="text-[9px] text-subtle font-bold uppercase">Order Reference</p>
                                        <p className="font-bold text-gray-800 dark:text-white mt-0.5">#IPT-{(100000 + trackOrderResult.id)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-subtle font-bold uppercase">Total Price</p>
                                        <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">R {parseFloat(trackOrderResult.total_amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className={`px-2 py-0.5 border rounded-full text-[8px] font-bold uppercase ${
                                            getStatusDetails(trackOrderResult.status).color
                                        }`}>
                                            {getStatusDetails(trackOrderResult.status).text}
                                        </span>
                                    </div>
                                </div>

                                {/* Order items list */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {trackOrderResult.items.map((item) => (
                                        <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-3">
                                                <img src={item.variant.product.image_path} alt={item.variant.product.name} className="w-8 h-8 object-contain bg-white p-0.5 border border-gray-100 rounded-lg flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{item.variant.product.name}</p>
                                                    <p className="text-[9px] text-subtle mt-0.5">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-extrabold text-gray-900 dark:text-white">R {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Tracking Map Canvas and coordinates visualizer */}
                                {trackOrderResult.status !== 'cancelled' && (
                                    <div className="pt-2">
                                        <TrackingMap 
                                            hereApiKey={hereApiKey} 
                                            city={trackOrderResult.city} 
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* C. Shopping Cart Sidebar Drawer */}
            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
            />
        </>
    );
}
