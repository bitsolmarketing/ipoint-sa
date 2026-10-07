import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Package, Settings, Clock, ShieldCheck, Truck, XCircle, ShoppingBag, ChevronRight } from 'lucide-react';

// Live Order Tracking Map Component using HERE Maps API
function TrackingMap({ hereApiKey, city, orderId }) {
    const mapRef = useRef(null);
    const [mapError, setMapError] = useState(false);

    // Coordinate mapping for South African destination cities
    const getCoordinates = (cityName) => {
        const name = (cityName || '').toLowerCase();
        if (name.includes('cape town') || name.includes('bellville') || name.includes('somerset')) {
            return { lat: -33.9249, lng: 18.4241 }; // Cape Town
        }
        if (name.includes('durban') || name.includes('umhlanga') || name.includes('pinetown')) {
            return { lat: -29.8587, lng: 31.0218 }; // Durban
        }
        if (name.includes('pretoria') || name.includes('centurion')) {
            return { lat: -25.7479, lng: 28.2293 }; // Pretoria
        }
        if (name.includes('port elizabeth') || name.includes('gqeberha')) {
            return { lat: -33.9608, lng: 25.6022 }; // Gqeberha
        }
        return { lat: -26.2041, lng: 28.0473 }; // Default Johannesburg
    };

    useEffect(() => {
        // If there's no API key or HERE is not loaded in the window, trigger fallback
        if (!hereApiKey || !window.H) {
            setMapError(true);
            return;
        }

        try {
            // Clean container before mounting
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }

            // Warehouse: iPoint, Village Green Shopping Centre, Greenside, Johannesburg
            const dispatchCoords = { lat: -26.1458, lng: 28.0075 };
            const destCoords = getCoordinates(city);

            // Initialize platform
            const platform = new window.H.service.Platform({
                apikey: hereApiKey
            });

            const defaultLayers = platform.createDefaultLayers();

            // Initialize Map
            const map = new window.H.Map(
                mapRef.current,
                defaultLayers.vector.normal.map,
                {
                    zoom: 6,
                    center: dispatchCoords,
                    pixelRatio: window.devicePixelRatio || 1
                }
            );

            // Enable interactions (pan, zoom, double tap zoom)
            const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));

            // Create default UI
            const ui = window.H.ui.UI.createDefault(map, defaultLayers);

            // Create markers
            const dispatchMarker = new window.H.map.Marker(dispatchCoords);
            const destinationMarker = new window.H.map.Marker(destCoords);

            map.addObjects([dispatchMarker, destinationMarker]);

            // Draw line route representing shipping dispatch
            const lineString = new window.H.geo.LineString();
            lineString.pushPoint(dispatchCoords);
            lineString.pushPoint(destCoords);

            const routeLine = new window.H.map.Polyline(lineString, {
                style: { strokeColor: '#0066CC', lineWidth: 4 }
            });

            map.addObject(routeLine);

            // Auto fit route bounds into map viewport
            map.getLookAtDataProvider().zoomTo(routeLine.getBoundingBox());

        } catch (e) {
            console.error('HERE Maps failed initialization:', e);
            setMapError(true);
        }
    }, [hereApiKey, city]);

    if (mapError || !hereApiKey || !window.H) {
        // Beautiful fallback SVG route visualization
        return (
            <div className="bg-gray-50 dark:bg-gray-850 rounded-2xl p-6 text-center space-y-4 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Dispatch: Johannesburg</span>
                    <span className="text-[#0066CC]">In Transit</span>
                    <span>Destination: {city || 'Your Address'}</span>
                </div>
                {/* SVG Route mapping */}
                <div className="relative h-12 w-full bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center px-6 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                    {/* Dashed line */}
                    <div className="flex-grow border-t-2 border-dashed border-[#0066CC]/30 mx-3 relative">
                        {/* Animated Truck icon */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-[45%] text-[#0066CC] animate-bounce flex items-center space-x-1">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0066CC] animate-ping absolute right-6" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0066CC]" />
                </div>
                <p className="text-[10px] text-gray-400 italic">Configure `HERE_API_KEY` in `.env` to show live interactive maps.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            <div className="flex justify-between items-baseline text-[9px] font-extrabold text-gray-450 uppercase tracking-wider">
                <span>Dispatch: Greenside (JHB)</span>
                <span className="text-[#0066CC] animate-pulse">Live Shipment Tracking Map</span>
                <span>Destination: {city || 'Your City'}</span>
            </div>
            {/* Map Canvas */}
            <div ref={mapRef} className="h-60 w-full rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-850 bg-[#F5F5F7]" />
        </div>
    );
}

export default function Edit({ mustVerifyEmail, status, orders }) {
    const { hereApiKey } = usePage().props;
    const [activeTab, setActiveTab] = useState('orders'); // Default to orders tab as requested

    const tabs = [
        { id: 'orders', name: 'My Purchases & Orders', icon: Package },
        { id: 'profile', name: 'Account Settings', icon: Settings }
    ];

    const getStatusDetails = (status) => {
        switch (status) {
            case 'paid':
                return {
                    color: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-transparent',
                    text: 'Paid & Processing',
                    icon: ShieldCheck,
                    step: 2
                };
            case 'shipped':
                return {
                    color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-transparent',
                    text: 'Shipped (In Transit)',
                    icon: Truck,
                    step: 3
                };
            case 'cancelled':
                return {
                    color: 'bg-red-50 text-red-750 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-transparent',
                    text: 'Cancelled',
                    icon: XCircle,
                    step: 0
                };
            default:
                return {
                    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-transparent',
                    text: 'Pending Payment',
                    icon: Clock,
                    step: 1
                };
        }
    };

    return (
        <StorefrontLayout>
            <Head title="My Account Portal — iStore" />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 font-sans">
                {/* Dashboard Title */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">
                        Account Portal
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Manage your Apple orders, profile details, and security.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column Navigation Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center space-x-3 text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-[#0066CC] text-white shadow-md'
                                            : 'bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column Content Window */}
                    <div className="lg:col-span-3">
                        {/* TAB 1: ORDER HISTORY */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 dark:border-gray-850">
                                        Purchase History
                                    </h2>

                                    {(!orders || orders.length === 0) ? (
                                        <div className="text-center py-16 space-y-4">
                                            <ShoppingBag className="w-12 h-12 text-gray-300 stroke-[1.25] mx-auto" />
                                            <p className="text-xs text-gray-400 font-medium">You haven't placed any orders yet.</p>
                                            <Link
                                                href="/"
                                                className="inline-block bg-[#0066CC] hover:bg-[#0077ED] text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-full transition-colors"
                                            >
                                                Start Shopping
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order) => {
                                                const statusSpec = getStatusDetails(order.status);
                                                const StatusIcon = statusSpec.icon;
                                                const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                });

                                                return (
                                                    <div 
                                                        key={order.id} 
                                                        className="border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/10"
                                                    >
                                                        {/* Order Header info */}
                                                        <div className="bg-white dark:bg-[#1D1D1F] px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow">
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Order Placed</p>
                                                                    <p className="font-semibold text-gray-800 dark:text-white mt-1">{formattedDate}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total Price</p>
                                                                    <p className="font-extrabold text-gray-900 dark:text-white mt-1">R {parseFloat(order.total_amount).toLocaleString()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Order Reference</p>
                                                                    <p className="font-mono text-gray-800 dark:text-white font-semibold mt-1">#IST-{(100000 + order.id)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Deliver method</p>
                                                                    <p className="font-semibold text-gray-800 dark:text-white mt-1">Standard Shipping</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex-shrink-0 flex items-center">
                                                                <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase flex items-center space-x-1.5 ${statusSpec.color}`}>
                                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                                    <span>{statusSpec.text}</span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Order Items list */}
                                                        <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#1D1D1F]/40">
                                                            {order.items.map((item) => (
                                                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-4">
                                                                    <div className="flex items-center space-x-4">
                                                                        <div className="w-12 h-12 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white p-1.5 flex items-center justify-center flex-shrink-0">
                                                                            <img src={item.variant.product.image_path} alt={item.variant.product.name} className="max-h-full max-w-full object-contain" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-gray-900 dark:text-white leading-snug">{item.variant.product.name}</p>
                                                                            <div className="flex space-x-2.5 text-[10px] text-gray-400 mt-1">
                                                                                {item.variant.color && <span>Color: {item.variant.color.name}</span>}
                                                                                {item.variant.size && <span>• Size: {item.variant.size.name}</span>}
                                                                                <span>• Qty: {item.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className="font-extrabold text-gray-900 dark:text-white flex-shrink-0">
                                                                        R {(item.price * item.quantity).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Shipments tracker progress */}
                                                        {order.status !== 'cancelled' && (
                                                            <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-150 dark:border-gray-800">
                                                                <p className="text-[10px] font-bold text-gray-450 uppercase mb-4 tracking-wider">Shipment Delivery Progress</p>
                                                                <div className="relative">
                                                                    {/* Progress Line */}
                                                                    <div className="absolute top-2.5 left-4 right-4 h-1 bg-gray-200 dark:bg-gray-800 -z-10" />
                                                                    <div 
                                                                        className="absolute top-2.5 left-4 h-1 bg-[#0066CC] -z-10 transition-all duration-500" 
                                                                        style={{ 
                                                                            width: `${
                                                                                statusSpec.step === 1 ? '10%' :
                                                                                statusSpec.step === 2 ? '50%' :
                                                                                statusSpec.step === 3 ? '100%' : '0%'
                                                                            }` 
                                                                        }} 
                                                                    />

                                                                    {/* Tracker Steps */}
                                                                    <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold border text-[9px] ${
                                                                                statusSpec.step >= 1 ? 'bg-[#0066CC] text-white border-transparent' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                                                                            }`}>1</span>
                                                                            <span className="mt-1.5 text-gray-500 dark:text-gray-400">Payment Pending</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold border text-[9px] ${
                                                                                statusSpec.step >= 2 ? 'bg-[#0066CC] text-white border-transparent' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                                                                            }`}>2</span>
                                                                            <span className="mt-1.5 text-gray-500 dark:text-gray-400">Processing</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold border text-[9px] ${
                                                                                statusSpec.step >= 3 ? 'bg-[#0066CC] text-white border-transparent' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                                                                            }`}>3</span>
                                                                            <span className="mt-1.5 text-gray-500 dark:text-gray-400">Shipped</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Map tracker integration */}
                                                                {(order.status === 'paid' || order.status === 'shipped') && (
                                                                    <div className="mt-6 pt-6 border-t border-gray-150 dark:border-gray-855">
                                                                        <TrackingMap 
                                                                            hereApiKey={hereApiKey} 
                                                                            city={order.city} 
                                                                            orderId={order.id} 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PROFILE BREEZE FORMS */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Profile settings */}
                                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-xl text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                                    <UpdatePasswordForm className="max-w-xl text-gray-900 dark:text-white" />
                                </div>

                                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                                    <DeleteUserForm className="max-w-xl text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
