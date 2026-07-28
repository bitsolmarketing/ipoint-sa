import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

// Apple glyph as an inline SVG — the private-use character does not render off Apple devices.
const AppleIcon = (props) => (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

// Brand/social glyphs (not available in this lucide-react build) as inline SVGs.
const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>
);
const InstagramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);
const TwitterIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M23.64 4.94c-.83.37-1.72.62-2.66.73a4.66 4.66 0 0 0 2.05-2.57c-.9.53-1.9.92-2.96 1.13a4.65 4.65 0 0 0-7.93 4.24 13.2 13.2 0 0 1-9.6-4.86 4.65 4.65 0 0 0 1.44 6.2 4.6 4.6 0 0 1-2.1-.58v.06a4.65 4.65 0 0 0 3.73 4.56 4.66 4.66 0 0 1-2.1.08 4.66 4.66 0 0 0 4.35 3.23A9.34 9.34 0 0 1 0 19.54a13.16 13.16 0 0 0 7.14 2.09c8.57 0 13.25-7.1 13.25-13.25l-.01-.6a9.4 9.4 0 0 0 2.32-2.41Z" /></svg>
);
const WhatsappIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.5-5.26c0-5.45 4.43-9.88 9.89-9.88a9.82 9.82 0 0 1 6.98 2.9 9.82 9.82 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.89 9.89M20.52 3.45A11.94 11.94 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.14 1.6 5.95L0 24l6.33-1.66a11.9 11.9 0 0 0 5.71 1.45h.01c6.58 0 11.94-5.36 11.95-11.95a11.87 11.87 0 0 0-3.48-8.42" /></svg>
);

export default function Footer() {
    // Admin-managed strip above the footer columns (Banner position `footer`).
    // Shared from HandleInertiaRequests so it shows on every page; null hides it.
    const { footerBanner } = usePage().props;
    const year = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;
        setSubscribed(true);
        setEmail('');
    };

    const columns = [
        {
            title: 'Shop Now',
            links: [
                { label: 'iPhone', href: '/category/iphone' },
                { label: 'iPad', href: '/category/ipad' },
                { label: 'Mac', href: '/category/mac' },
                { label: 'Watch', href: '/category/watch' },
                { label: 'AirPods', href: '/category/airpods' },
                { label: 'Accessories', href: '/category/accessories' },
            ],
        },
        {
            title: 'Quick Links',
            links: [
                { label: 'About Us', href: '/services' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Become a Reseller', href: '/services' },
                { label: 'Careers', href: '/services' },
                { label: 'Locate Reseller', href: '/apple-product-repair' },
            ],
        },
        {
            title: 'Support',
            links: [
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms and Conditions', href: '/privacy' },
            ],
        },
    ];

    const socials = [
        { Icon: FacebookIcon, href: '#', label: 'Facebook', className: 'bg-[#1877F2]' },
        { Icon: InstagramIcon, href: '#', label: 'Instagram', className: 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
        { Icon: TwitterIcon, href: '#', label: 'Twitter', className: 'bg-[#1DA1F2]' },
        { Icon: WhatsappIcon, href: '#', label: 'WhatsApp', className: 'bg-[#25D366]' },
    ];

    return (
        <footer className="bg-black text-white pt-16 pb-8 px-6 sm:px-12 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Footer banner strip — admin-managed, hidden when unset */}
                {footerBanner?.image_path && (() => {
                    const Wrapper = footerBanner.link_url ? Link : 'div';
                    return (
                        <Wrapper
                            href={footerBanner.link_url || undefined}
                            className="block rounded-2xl overflow-hidden mb-14 group"
                        >
                            <img
                                src={footerBanner.image_path}
                                alt={footerBanner.title || 'Promotion'}
                                loading="lazy"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                        </Wrapper>
                    );
                })()}

                {/* Top: link columns + subscribe + socials */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-x-8 gap-y-10">
                    {columns.map((col) => (
                        <div key={col.title} className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-white mb-5">{col.title}</h3>
                            <ul className="space-y-3.5 text-sm">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Sign Up And Subscribe */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-4">
                        <h3 className="text-lg font-semibold text-white mb-5">Sign Up And Subscribe</h3>
                        <p className="text-sm text-gray-400 mb-5 max-w-xs">
                            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex items-stretch gap-3 max-w-sm">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                aria-label="Email address"
                                className="flex-1 min-w-0 bg-transparent border border-white/40 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                            />
                            <button
                                type="submit"
                                className="flex-shrink-0 border border-white/60 rounded-md px-5 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors"
                            >
                                Submit
                            </button>
                        </form>
                        {subscribed && (
                            <p className="mt-3 text-xs text-green-400">Thanks for subscribing!</p>
                        )}
                    </div>

                    {/* Connect With Us */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-5">Connect With Us</h3>
                        <div className="flex items-center gap-3">
                            {socials.map(({ Icon, href, label, className }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm hover:opacity-90 hover:scale-105 transition-all ${className}`}
                                >
                                    <Icon className="w-[18px] h-[18px]" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom: brand lockup + authorised badges */}
                <div className="mt-14 pt-4 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" aria-label="iPoint home" className="inline-flex items-baseline font-extrabold tracking-tight leading-none text-2xl">
                            <span className="text-white">i</span>
                            <span className="text-[#0066CC]">Point</span>
                        </Link>
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-2.5 py-1 text-white/90">
                            <AppleIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-[9px] leading-[1.15] font-semibold uppercase tracking-wide">Authorised<br />Reseller</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                        Copyright © {year} iPoint. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
