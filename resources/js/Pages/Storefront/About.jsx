import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
    Smartphone, RefreshCw, Gift, ShoppingBag,
    RotateCcw, Truck, ShieldCheck, Headset,
    Award, MessageSquareHeart, HeartHandshake, Store, ChevronRight,
} from 'lucide-react';

const OFFERINGS = [
    {
        icon: Smartphone,
        title: 'Devices and accessories',
        body: "A wide range of products and accessories from leading manufacturers, all covered by the manufacturer's warranty.",
    },
    {
        icon: RefreshCw,
        title: 'iPoint Pre-owned',
        body: 'Quality pre-owned products at more accessible prices, so more people can enjoy the technology they want.',
    },
    {
        icon: Gift,
        title: 'Software, gift cards and vouchers',
        body: 'Digital and gift options for every occasion.',
    },
    {
        icon: ShoppingBag,
        title: 'Online shopping',
        body: 'Browse, buy and log your returns on our Website, with delivery or collection to suit you.',
    },
];

const PROMISES = [
    {
        icon: RotateCcw,
        title: 'Fair, clear returns',
        body: 'A transparent Returns Policy, with a 30-day window for unwanted products and support for faulty or damaged items.',
    },
    {
        icon: Truck,
        title: 'Free collection for faulty or damaged goods',
        body: "If something arrives damaged or develops a fault, we'll arrange collection at no charge.",
    },
    {
        icon: ShieldCheck,
        title: 'Security you can rely on',
        body: 'We verify refund requests and process refunds to the original payment method to protect every customer.',
    },
    {
        icon: Headset,
        title: 'Expert help',
        body: 'Our team can guide you on compatibility, warranties and choosing the right product before you buy.',
    },
];

const VALUES = [
    { icon: Award, title: 'Quality', body: 'We stand behind the products we sell.' },
    { icon: MessageSquareHeart, title: 'Honesty', body: 'We say what we mean and keep our policies clear.' },
    { icon: HeartHandshake, title: 'Care', body: 'Every customer is treated with respect, from the first enquiry to after-sales support.' },
];

export default function About() {
    return (
        <StorefrontLayout>
            <Head title="About iPoint — Premium Technology, Made Easy" />

            {/* Header Jumbotron */}
            <div className="bg-page dark:bg-surface-dark py-20 border-b border-line-light dark:border-gray-800">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Who We Are</span>
                    <h1 className="text-4xl font-extrabold text-heading dark:text-white tracking-tight mt-3">
                        About iPoint
                    </h1>
                    <p className="text-sm text-muted dark:text-subtle mt-4 max-w-2xl mx-auto leading-relaxed">
                        iPoint is your destination for premium technology. We offer a carefully selected range of devices,
                        accessories and software, whether you shop with us online or visit us in store. Our aim is simple:
                        to make great technology easy to buy, easy to use and easy to trust.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 space-y-20 font-sans">
                {/* What we offer */}
                <section>
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">What We Offer</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-2">
                            Everything you need, in one place.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {OFFERINGS.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="glass-card rounded-3xl p-7 space-y-4">
                                <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
                                <p className="text-xs text-muted dark:text-subtle leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Service promise */}
                <section>
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Our Service Promise</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-2">
                            Service you can count on.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PROMISES.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="glass-card rounded-3xl p-7 flex items-start gap-5">
                                <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
                                    <p className="text-xs text-muted dark:text-subtle leading-relaxed">{body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Values */}
                <section>
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Our Values</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-heading dark:text-white tracking-tight mt-2">
                            What guides us.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {VALUES.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="glass-card rounded-3xl p-8 text-center space-y-4">
                                <div className="w-12 h-12 mx-auto rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-extrabold text-heading dark:text-white">{title}</h3>
                                <p className="text-xs text-muted dark:text-subtle leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Get in touch */}
                <section className="glass-card rounded-3xl p-10 text-center space-y-5">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                        <Store className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-heading dark:text-white tracking-tight">Get in touch</h2>
                    <p className="text-sm text-muted dark:text-subtle max-w-xl mx-auto leading-relaxed">
                        Visit us in store, shop on our Website, or reach out to our team with any question before or after you buy.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-white text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                            Shop online <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-line-light dark:border-gray-700 text-sm font-bold text-heading dark:text-white hover:bg-page dark:hover:bg-gray-800 transition-colors"
                        >
                            Contact us
                        </Link>
                    </div>
                </section>
            </div>
        </StorefrontLayout>
    );
}
