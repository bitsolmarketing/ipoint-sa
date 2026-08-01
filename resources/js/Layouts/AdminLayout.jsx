import React, { useState, useEffect } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import {
    LayoutDashboard, Tag, Laptop, Palette, Layers, Ruler, Image,
    ShoppingBag, Globe, LogOut, Menu, X, ChevronRight, CheckCircle, AlertCircle,
    Sparkles, MessageSquare, Wrench
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { auth, flash } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [toast, setToast] = useState(null);
    const { post } = useForm();

    const currentUrl = usePage().url;

    const navItems = [
        { name: 'Dashboard', url: '/admin', icon: LayoutDashboard },
        { name: 'Categories', url: '/admin/categories', icon: Tag },
        { name: 'Products', url: '/admin/products', icon: Laptop },
        { name: 'Colors', url: '/admin/colors', icon: Palette },
        { name: 'Attributes', url: '/admin/attributes', icon: Layers },
        { name: 'Sizes', url: '/admin/sizes', icon: Ruler },
        { name: 'Banners', url: '/admin/banners', icon: Image },
        { name: 'Offers', url: '/admin/offers', icon: Sparkles },
        { name: 'Reviews', url: '/admin/reviews', icon: MessageSquare },
        { name: 'Repairs', url: '/admin/repairs', icon: Wrench },
        { name: 'Orders', url: '/admin/orders', icon: ShoppingBag },
    ];

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#151516] flex font-sans antialiased text-gray-800 dark:text-gray-200">
            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1D1D1F] border-r border-gray-100 dark:border-gray-800 transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden'
            } md:translate-x-0 md:static md:block transition-all duration-300 ease-in-out flex flex-col justify-between`}>
                <div>
                    {/* Brand */}
                    <div className="h-16 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#1D1D1F]">
                        <Link href="/admin" className="flex items-center space-x-2">
                            <span className="text-xl"></span>
                            <span className="font-bold text-sm tracking-wider text-gray-900 dark:text-white">Admin Control</span>
                        </Link>
                        <button className="md:hidden p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsSidebarOpen(false)}>
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className="py-6 px-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Check if currentUrl matches or starts with item.url
                            const isActive = currentUrl === item.url || (item.url !== '/admin' && currentUrl.startsWith(item.url));

                            return (
                                <Link 
                                    key={item.name}
                                    href={item.url}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                        isActive 
                                            ? 'bg-[#0066CC] text-white shadow-md' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer User Info */}
                <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-[#1D1D1F]">
                    <div className="flex items-center space-x-3 px-2 py-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-[#0066CC]">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{auth.user.name}</p>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">Admin Profile</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link 
                            href="/" 
                            className="flex items-center justify-center space-x-1.5 py-2 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Globe className="w-3 h-3" />
                            <span>Live Store</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center justify-center space-x-1.5 py-2 text-[10px] font-bold rounded-lg bg-[#FDF2F2] hover:bg-[#FDE2E2] text-[#D32F2F] transition-colors"
                        >
                            <LogOut className="w-3 h-3" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Navbar */}
                <header className="h-16 bg-white dark:bg-[#1D1D1F] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center space-x-4">
                        <button 
                            className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 md:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5 text-gray-400" />
                        </button>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">iPoint Admin Control Panel</h2>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/35 text-green-700 dark:text-green-300 font-medium">
                            System Online
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Toast Alerts */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl shadow-xl border ${
                        toast.type === 'success' 
                            ? 'bg-[#EAFDF2] dark:bg-[#1E3A2B] border-[#A3F0C2] dark:border-[#2D6A4F] text-[#1E7E34] dark:text-[#A3F0C2]' 
                            : 'bg-[#FDF2F2] dark:bg-[#3D1E1E] border-[#F0A3A3] dark:border-[#6A2D2D] text-[#D32F2F] dark:text-[#F0A3A3]'
                    }`}>
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold">{toast.message}</span>
                        <button 
                            onClick={() => setToast(null)}
                            className="p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
