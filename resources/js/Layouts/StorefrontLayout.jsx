import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Navigation from '@/Components/Navigation';
import Footer from '@/Components/Footer';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function StorefrontLayout({ children }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

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

    return (
        // `storefront-theme` scopes the admin-configured palette to the shop.
        // The admin panel sits outside it and always renders the stock colours,
        // so an unreadable palette can never lock anyone out of the CMS.
        <div className="storefront-theme min-h-screen bg-page dark:bg-page-dark flex flex-col font-sans antialiased text-heading dark:text-page">
            {/* Top Navigation */}
            <Navigation />

            {/* Main Content Area */}
            <main className="flex-grow pt-[72px]">
                {children}
            </main>

            {/* Footer Component */}
            <Footer />

            {/* Floating Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
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
