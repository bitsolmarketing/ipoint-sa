import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/**
 * Every storefront colour is a CSS custom property holding space-separated RGB
 * channels, declared through `<alpha-value>` so opacity modifiers (`bg-brand/10`)
 * keep working. Defaults are emitted on :root and the admin-configured palette
 * on `.storefront-theme` — both rendered by App\Support\ThemePalette.
 */
const themed = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
    // Class strategy so the `dark:` utilities and the custom `.dark .glass-*`
    // rules in app.css key off the same signal. The class is set from the
    // browser's prefers-color-scheme in app.blade.php.
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },

            colors: {
                // Brand
                'brand': themed('brand'),
                'brand-hover': themed('brand-hover'),
                'brand-tint': themed('brand-tint'),
                'brand-tint-alt': themed('brand-tint-alt'),
                'accent': themed('accent'),

                // Text
                'heading': themed('heading'),
                'body': themed('body'),
                'muted': themed('muted'),
                'subtle': themed('subtle'),

                // Surfaces
                'page': themed('page'),
                'page-dark': themed('page-dark'),
                'surface': themed('surface'),
                'surface-dark': themed('surface-dark'),
                'surface-dark-alt': themed('surface-dark-alt'),
                'line': themed('line'),
                'line-light': themed('line-light'),
                'line-soft': themed('line-soft'),

                // Banners & hero
                'banner-bg': themed('banner-bg'),
                'banner-text': themed('banner-text'),
                'banner-button': themed('banner-button'),
                'banner-button-text': themed('banner-button-text'),
                'banner-dot': themed('banner-dot'),

                // Status & badges
                'sale': themed('sale'),
                'success': themed('success'),
                'success-hover': themed('success-hover'),
                'gold': themed('gold'),
                'gold-light': themed('gold-light'),
                'gold-tint': themed('gold-tint'),
            },
        },
    },

    plugins: [forms],
};
