import React, { useMemo, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Palette, RotateCcw, Save, Check, Star, ShoppingBag } from 'lucide-react';
import InputError from '@/Components/InputError';

/** "#0066CC" -> "0 102 204", the channel form the CSS custom properties hold. */
const toChannels = (hex) => {
    const clean = (hex || '').replace('#', '');
    if (clean.length !== 6) return '0 0 0';
    return [0, 2, 4].map((i) => parseInt(clean.substr(i, 2), 16)).join(' ');
};

const isHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(value || '');

function ColorField({ token, value, isDefault, onChange, error }) {
    return (
        <div className="flex items-start gap-3 py-3">
            <div className="relative flex-shrink-0">
                <input
                    type="color"
                    value={isHex(value) ? value : token.default}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent p-0.5"
                    title={`Pick ${token.label}`}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{token.label}</label>
                    {!isDefault && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#0066CC]/10 text-[#0066CC]">
                            Changed
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{token.hint}</p>

                <div className="flex items-center gap-2 mt-1.5">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            const next = e.target.value.toUpperCase();
                            onChange(next.startsWith('#') || next === '' ? next : `#${next}`);
                        }}
                        maxLength={7}
                        spellCheck={false}
                        className="w-28 text-[11px] font-mono border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white uppercase"
                        placeholder={token.default}
                    />
                    {!isDefault && (
                        <button
                            type="button"
                            onClick={() => onChange(token.default)}
                            className="text-[10px] font-semibold text-gray-400 hover:text-[#0066CC] transition-colors"
                            title={`Reset to ${token.default}`}
                        >
                            Reset
                        </button>
                    )}
                </div>

                <InputError message={error} className="mt-1" />
            </div>
        </div>
    );
}

export default function Index({ tokenGroups, palette, defaults, presets }) {
    const { data, setData, post, processing, errors } = useForm({ colors: { ...palette } });
    const [activeGroup, setActiveGroup] = useState(Object.keys(tokenGroups)[0]);

    const setColor = (token, value) => setData('colors', { ...data.colors, [token]: value });

    const applyPreset = (preset) => {
        // A preset only states what it changes; everything else returns to stock.
        setData('colors', { ...defaults, ...preset.colors });
    };

    /** Inline CSS variables so the preview repaints as the pickers move. */
    const previewVars = useMemo(() => {
        const vars = {};
        Object.entries(data.colors).forEach(([token, hex]) => {
            if (isHex(hex)) vars[`--c-${token.replace(/_/g, '-')}`] = toChannels(hex);
        });
        return vars;
    }, [data.colors]);

    const changedCount = Object.keys(defaults).filter((t) => data.colors[t] !== defaults[t]).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.appearance.update'));
    };

    const handleReset = () => {
        if (confirm('Reset every colour back to the site defaults?')) {
            router.post(route('admin.appearance.reset'));
        }
    };

    return (
        <AdminLayout>
            <Head title="Appearance" />

            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                {/* Header */}
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Palette className="w-5 h-5 text-[#0066CC]" />
                            Appearance
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Set the colours used across the storefront — home page, text, banners, buttons and badges.
                            {changedCount > 0 && <span className="text-[#0066CC] font-semibold"> {changedCount} changed.</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset all
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving…' : 'Save palette'}
                        </button>
                    </div>
                </div>

                {/* Presets */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Start from a preset</h2>
                    <div className="flex flex-wrap gap-3">
                        {presets.map((preset) => {
                            const swatch = { ...defaults, ...preset.colors };
                            return (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className="group text-left border border-gray-100 dark:border-gray-800 rounded-2xl p-3 hover:border-[#0066CC] transition-colors w-52"
                                >
                                    <div className="flex gap-1 mb-2">
                                        {['brand', 'brand_hover', 'accent', 'heading', 'page'].map((t) => (
                                            <span
                                                key={t}
                                                className="w-6 h-6 rounded-lg border border-black/5"
                                                style={{ backgroundColor: swatch[t] }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">{preset.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{preset.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
                    {/* Editor */}
                    <div className="xl:col-span-3 bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                        {/* Group tabs */}
                        <div className="flex flex-wrap gap-1 p-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            {Object.keys(tokenGroups).map((group) => (
                                <button
                                    key={group}
                                    type="button"
                                    onClick={() => setActiveGroup(group)}
                                    className={`px-3.5 py-2 rounded-full text-[11px] font-bold transition-colors ${
                                        activeGroup === group
                                            ? 'bg-[#0066CC] text-white'
                                            : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>

                        <div className="p-5 divide-y divide-gray-50 dark:divide-gray-800">
                            {(tokenGroups[activeGroup] || []).map((token) => (
                                <ColorField
                                    key={token.key}
                                    token={token}
                                    value={data.colors[token.key] ?? token.default}
                                    isDefault={(data.colors[token.key] ?? token.default) === token.default}
                                    onChange={(value) => setColor(token.key, value)}
                                    error={errors[`colors.${token.key}`]}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Live preview — the same token names the storefront uses, fed by
                        inline CSS variables so it repaints as the pickers move. */}
                    <div className="xl:col-span-2 xl:sticky xl:top-24">
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live preview</h2>
                            </div>

                            <div className="storefront-theme p-4 bg-page" style={previewVars}>
                                {/* Banner */}
                                <div className="rounded-2xl bg-banner-bg border border-line p-5 mb-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-1.5">New arrival</p>
                                    <h3 className="text-lg font-extrabold text-banner-text leading-tight">iPhone 15 Pro</h3>
                                    <p className="text-[11px] text-muted mt-1">Titanium. So strong. So light. So Pro.</p>
                                    <button
                                        type="button"
                                        className="mt-3 px-4 py-2 rounded-full bg-banner-button text-banner-button-text text-[11px] font-bold"
                                    >
                                        Shop now
                                    </button>
                                    <div className="flex gap-1.5 mt-3">
                                        <span className="w-5 h-1.5 rounded-full bg-banner-dot" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-line" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-line" />
                                    </div>
                                </div>

                                {/* Product card */}
                                <div className="rounded-2xl bg-surface border border-line-light p-4 mb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-heading truncate">MacBook Air 13" M3</p>
                                            <p className="text-[10px] text-subtle mt-0.5">8GB · 256GB · Midnight</p>
                                        </div>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gold-tint text-gold whitespace-nowrap">
                                            Gold Desire
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 mt-2">
                                        {[0, 1, 2, 3].map((i) => (
                                            <Star key={i} className="w-3 h-3 text-gold-light fill-gold-light" />
                                        ))}
                                        <span className="text-[10px] text-subtle ml-1">(128)</span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-sm font-extrabold text-sale">R 18 999</span>
                                        <span className="text-[10px] text-subtle line-through">R 22 999</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <button type="button" className="flex-1 py-2 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center gap-1.5">
                                            <ShoppingBag className="w-3 h-3" /> Add to bag
                                        </button>
                                        <button type="button" className="px-3 py-2 rounded-full border border-brand text-brand text-[11px] font-bold">
                                            Compare
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-success font-semibold mt-2 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> In stock — ships today
                                    </p>
                                </div>

                                {/* Tint strip + body copy */}
                                <div className="rounded-2xl bg-brand-tint p-3 mb-3">
                                    <p className="text-[11px] font-bold text-brand">Trade in and save up to R 6 000</p>
                                    <p className="text-[10px] text-body mt-0.5">Bring your old device into any store for a free assessment.</p>
                                </div>

                                {/* Dark surface sample */}
                                <div className="rounded-2xl bg-surface-dark p-4">
                                    <p className="text-[11px] font-bold text-white">Dark mode surface</p>
                                    <p className="text-[10px] text-subtle mt-0.5">Cards and panels when the visitor prefers dark.</p>
                                    <div className="mt-2 rounded-xl bg-surface-dark-alt px-3 py-2">
                                        <span className="text-[10px] text-accent font-semibold">Raised row / input</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-3 px-2 leading-relaxed">
                            These colours apply to the storefront only. The admin panel keeps its own fixed palette, so a
                            low-contrast choice can never lock you out of here.
                        </p>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
