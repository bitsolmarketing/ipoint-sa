import React from 'react';
import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Privacy() {
    return (
        <StorefrontLayout>
            <Head title="Privacy Policy — iPoint" />

            {/* Header Jumbotron */}
            <div className="bg-page dark:bg-surface-dark py-20 border-b border-line-light dark:border-gray-800">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Legal Terms</span>
                    <h1 className="text-4xl font-extrabold text-heading dark:text-white tracking-tight mt-3">
                        Privacy Policy
                    </h1>
                    <p className="text-xs text-subtle mt-2">
                        Last Updated: July 4, 2026
                    </p>
                </div>
            </div>

            {/* Policy Body */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 font-sans text-xs text-gray-700 dark:text-gray-300 space-y-8 leading-relaxed">
                
                <section className="space-y-3">
                    <h2 className="text-base font-extrabold text-heading dark:text-white">1. Introduction</h2>
                    <p>
                        Welcome to iPoint. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, store, share, and use your personal information when you visit our website or make a purchase from our store storefront.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-extrabold text-heading dark:text-white">2. Data We Collect</h2>
                    <p>
                        We collect information necessary to process your transactions and improve your user experience. This includes:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Personal Identification Details:</strong> Name, shipping address, email, telephone numbers.</li>
                        <li><strong>Transaction Records:</strong> Ordered product details, billing history, payment selectors chosen (Card or Cash on Delivery).</li>
                        <li><strong>Technical Interaction Data:</strong> Cookies, IP address, device location, browser settings, and page session durations.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-extrabold text-heading dark:text-white">3. How We Use Your Information</h2>
                    <p>
                        We use your collected personal information for processing payments, arranging express delivery services, rendering customer reviews on products, tracking deliveries, and sending transactional emails.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-extrabold text-heading dark:text-white">4. Payment Security</h2>
                    <p>
                        When paying with credit or debit cards, all information is processed securely using end-to-end encrypted gateways. Card number strings are never stored on our database servers.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-extrabold text-heading dark:text-white">5. Cookies and Tracking</h2>
                    <p>
                        We use cookies to maintain your shopping bag cart, track your local store pickup preference, and remember authorization settings across sessions. You can disable cookies inside your browser settings at any time.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-extrabold text-heading dark:text-white">6. Your Rights</h2>
                    <p>
                        You have the right to request access to the personal data we hold about you, request corrections, or request deletion of your account. Contact us at legal@ipoint.co.za for legal assistance.
                    </p>
                </section>
            </div>
        </StorefrontLayout>
    );
}
