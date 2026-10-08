import React, { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
    Wrench, ShieldCheck, XCircle, Smartphone, BatteryCharging, Layers,
    CloudUpload, LockKeyhole, BatteryFull, Check, ChevronRight, MapPin, CalendarDays,
    ClipboardCheck, PackageCheck, AlertTriangle, Store, Truck
} from 'lucide-react';

const CATEGORY_ICON = { screen: Smartphone, battery: BatteryCharging, rear_housing: Layers };

/** Fallback slots, used only if the admin has cleared every configured slot. */
const DEFAULT_TIME_SLOTS = ['09:00 – 11:00', '11:00 – 13:00', '13:00 – 15:00', '15:00 – 17:00'];

// Labels for repair types that exist in the /services price list but aren't one
// of the three headline categories shown further up this page.
const EXTRA_TYPE_LABEL = {
    camera: 'Camera module',
    charging_port: 'Charging port',
    keyboard: 'Keyboard',
};

export default function Repair({
    categories,
    locations,
    prefill = {},
    timeSlots = [],
    serviceModes = [],
    options = {},
}) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.key || 'screen');

    // Slots and service modes are configured in Admin → Repairs → Catalogue.
    const slots = timeSlots.length ? timeSlots : DEFAULT_TIME_SLOTS;
    const modes = serviceModes.length ? serviceModes : [{ key: 'in_store', label: 'In-store appointment' }];

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        repair_type: prefill.repair_type || categories[0]?.key || 'screen',
        service_mode: prefill.service_mode || modes[0].key,
        device_model: prefill.device_model || '',
        device_variant: prefill.device_variant || '',
        repair_location_id: locations[0]?.id || '',
        booking_date: '',
        time_slot: '',
        customer_name: '',
        email: '',
        phone: '',
        notes: '',
    });

    // A customer arriving from the /services price selector may have picked a
    // repair type or model outside the three headline categories — add it so
    // their choice survives the hand-off instead of silently resetting.
    const bookableCategories = useMemo(() => {
        if (!prefill.repair_type || categories.some((c) => c.key === prefill.repair_type)) {
            return categories;
        }
        return [
            ...categories,
            {
                key: prefill.repair_type,
                title: EXTRA_TYPE_LABEL[prefill.repair_type] || prefill.repair_type,
                description: 'Selected from the repair price list.',
                models: prefill.device_model ? [prefill.device_model] : [],
            },
        ];
    }, [categories, prefill.repair_type, prefill.device_model]);

    // Models available for the currently selected repair type.
    const modelsForType = useMemo(() => {
        const cat = bookableCategories.find((c) => c.key === data.repair_type);
        const models = cat ? [...cat.models] : [];

        if (prefill.device_model && data.repair_type === prefill.repair_type && !models.includes(prefill.device_model)) {
            models.unshift(prefill.device_model);
        }

        return models;
    }, [data.repair_type, bookableCategories, prefill.device_model, prefill.repair_type]);

    const submit = (e) => {
        e.preventDefault();
        post(route('repair.book'), {
            preserveScroll: true,
            onSuccess: () => reset('device_model', 'device_variant', 'booking_date', 'time_slot', 'customer_name', 'email', 'phone', 'notes'),
        });
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <StorefrontLayout>
            <Head title="Apple Product Repair" />

            {/* Intro */}
            <section className="bg-surface-dark text-white py-20 px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                        <Wrench className="w-3.5 h-3.5" /> Professional Repairs
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-tight">
                        Sometimes bad things happen to great products.
                    </h1>
                    <p className="text-sm sm:text-base text-gray-300 mt-4 leading-relaxed">
                        That doesn’t mean they’re beyond repair. Our technicians use genuine parts to bring your damaged
                        iPhone back to life — professionally, and with care.
                    </p>
                    <a href="#book" className="mt-8 inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold px-6 py-3 rounded-full transition-colors">
                        Book a repair <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-16">
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                        <Wrench className="w-3.5 h-3.5" /> How it works
                    </span>
                    <h2 className="text-2xl font-extrabold text-heading dark:text-white tracking-tight mt-2">Book your repair in four steps</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: CalendarDays, title: 'Book online', body: 'Choose your repair type, model, store and a time slot that suits you.' },
                        { icon: ClipboardCheck, title: 'We assess', body: 'A technician evaluates your device and confirms the repair and any cost.' },
                        { icon: Wrench, title: 'We repair', body: 'Genuine parts are fitted and your device is fully tested before it leaves us.' },
                        { icon: PackageCheck, title: 'Collect', body: 'Pick up your restored device, backed by our workmanship warranty.' },
                    ].map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={i} className="relative bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6">
                                <span className="absolute top-4 right-6 text-3xl font-extrabold text-gray-100 dark:text-gray-800 leading-none select-none">{i + 1}</span>
                                <span className="w-11 h-11 rounded-2xl bg-brand-tint dark:bg-blue-950/30 text-brand flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">{step.title}</h3>
                                <p className="text-xs text-muted dark:text-subtle mt-2 leading-relaxed">{step.body}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Eligible vs Ineligible */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                <h2 className="text-2xl font-extrabold text-heading dark:text-white tracking-tight text-center mb-10">What we can repair</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-green-200 dark:border-green-900/40 bg-green-50/60 dark:bg-green-950/10 p-8">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <ShieldCheck className="w-6 h-6" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Eligible damage</h3>
                        </div>
                        <ul className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Accidental LCD fractures</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Glass fractures</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Damage caused by defects in materials or workmanship</li>
                        </ul>
                    </div>
                    <div className="rounded-3xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/10 p-8">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                            <XCircle className="w-6 h-6" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Ineligible damage</h3>
                        </div>
                        <ul className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> 3rd-party, missing or disassembled components</li>
                            <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> Intentional tampering</li>
                            <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> Catastrophic damage</li>
                        </ul>
                        <p className="text-[11px] text-muted dark:text-subtle mt-5 leading-relaxed border-t border-red-200/60 dark:border-red-900/30 pt-4">
                            A flat additional levy applies to restore an ineligible device to standard condition before repair.
                            The exact amount is confirmed on inspection.
                        </p>
                    </div>
                </div>

                {/* Damage restrictions */}
                <div className="mt-6 rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/10 p-8">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Damage restrictions</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">
                        A device with any of the following will not qualify for a screen replacement:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
                        {[
                            'Severe housing damage — light dents and scratches are fine',
                            'A bent chassis',
                            'Multiple simultaneous faults — e.g. screen damage plus water damage or no power',
                            'Cracked or smashed rear housing glass',
                        ].map((t) => (
                            <div key={t} className="flex gap-2">
                                <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> {t}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Repair categories */}
            <section className="bg-white dark:bg-surface-dark border-y border-gray-100 dark:border-gray-800 py-16 px-4 sm:px-6 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-extrabold text-heading dark:text-white tracking-tight text-center mb-10">Repair categories</h2>
                    <div className="space-y-4">
                        {categories.map((cat) => {
                            const Icon = CATEGORY_ICON[cat.key] || Wrench;
                            const open = activeCategory === cat.key;
                            return (
                                <div key={cat.key} className="border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden">
                                    <button
                                        onClick={() => setActiveCategory(open ? null : cat.key)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-11 h-11 rounded-2xl bg-brand-tint dark:bg-blue-950/30 text-brand flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{cat.title}</h3>
                                                <p className="text-xs text-subtle mt-0.5">{cat.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-subtle transition-transform ${open ? 'rotate-90' : ''}`} />
                                    </button>
                                    {open && (
                                        <div className="px-6 pb-6 pt-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle mb-3">Supported models</p>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.models.map((m) => (
                                                    <span key={m} className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{m}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pre-repair checklist */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                <h2 className="text-2xl font-extrabold text-heading dark:text-white tracking-tight text-center mb-10">Before you book</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: CloudUpload, title: 'Back up your device', body: 'A repair requires a restore, which wipes existing content. Back up to iCloud or your computer first.' },
                        { icon: LockKeyhole, title: 'Sign out of iCloud', body: 'Disable Find My iPhone and sign out of iCloud so we can service the device.' },
                        { icon: BatteryFull, title: 'Fully charge your device', body: 'A full charge is needed so we can run a complete diagnostic report.' },
                    ].map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={i} className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                                    <Icon className="w-5 h-5 text-subtle" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">{step.title}</h3>
                                <p className="text-xs text-muted dark:text-subtle mt-2 leading-relaxed">{step.body}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Booking form */}
            <section id="book" className="bg-page dark:bg-page-dark border-y border-gray-150 dark:border-gray-800 py-16 px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand"><CalendarDays className="w-3.5 h-3.5" /> Book online</span>
                        <h2 className="text-2xl font-extrabold text-heading dark:text-white tracking-tight mt-2">Schedule your repair</h2>
                    </div>

                    {recentlySuccessful && (
                        <div className="mb-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 rounded-2xl p-4 text-xs font-semibold text-center">
                            Your booking request has been received. Check the confirmation notice for your reference number.
                        </div>
                    )}

                    <form onSubmit={submit} className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-5 font-sans">
                        {/* Service mode */}
                        <div>
                            <label className="block text-[10px] font-bold text-subtle uppercase mb-2">How would you like to be serviced?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {modes.map((mode) => {
                                    const Icon = mode.key === 'home_collection' ? Truck : Store;
                                    const hint = mode.key === 'home_collection'
                                        ? 'We collect and return it to you'
                                        : 'Drop your device off at a store';
                                    const selected = data.service_mode === mode.key;
                                    return (
                                        <button type="button" key={mode.key}
                                            onClick={() => setData('service_mode', mode.key)}
                                            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${selected ? 'border-brand bg-brand-tint/40 dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-800'}`}>
                                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selected ? 'text-brand' : 'text-subtle'}`} />
                                            <span>
                                                <span className={`block text-xs font-bold ${selected ? 'text-brand' : 'text-gray-700 dark:text-gray-300'}`}>{mode.label}</span>
                                                <span className="block text-[10px] text-subtle mt-0.5">{hint}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.service_mode && <p className="text-sale text-[10px] mt-1">{errors.service_mode}</p>}
                        </div>

                        {/* Repair type */}
                        <div>
                            <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Repair type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {bookableCategories.map((cat) => (
                                    <button type="button" key={cat.key}
                                        onClick={() => { setData('repair_type', cat.key); setData('device_model', ''); setActiveCategory(cat.key); }}
                                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${data.repair_type === cat.key ? 'border-brand bg-brand-tint/40 text-brand dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                        {cat.title}
                                    </button>
                                ))}
                            </div>
                            {errors.repair_type && <p className="text-sale text-[10px] mt-1">{errors.repair_type}</p>}
                        </div>

                        {/* Device model + storage + location */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Device model</label>
                                <select value={data.device_model} onChange={(e) => setData('device_model', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white">
                                    <option value="">Select model…</option>
                                    {modelsForType.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                                {errors.device_model && <p className="text-sale text-[10px] mt-1">{errors.device_model}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Storage / size</label>
                                <input type="text" value={data.device_variant} onChange={(e) => setData('device_variant', e.target.value)}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" placeholder="256GB (optional)" />
                                {errors.device_variant && <p className="text-sale text-[10px] mt-1">{errors.device_variant}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">
                                    {data.service_mode === 'home_collection' ? 'Servicing branch' : 'Store / location'}
                                </label>
                                <select value={data.repair_location_id} onChange={(e) => setData('repair_location_id', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white">
                                    <option value="">Select store…</option>
                                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}{l.city ? ` — ${l.city}` : ''}</option>)}
                                </select>
                                {errors.repair_location_id && <p className="text-sale text-[10px] mt-1">{errors.repair_location_id}</p>}
                            </div>
                        </div>
                        {data.service_mode === 'home_collection' && (
                            <p className="text-[10px] text-muted dark:text-subtle flex items-start gap-1.5 -mt-2">
                                <Truck className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                Add your collection address in the notes below. The chosen branch is where your device will be serviced.
                            </p>
                        )}

                        {/* Date + slot */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Preferred date</label>
                                <input type="date" min={today} value={data.booking_date} onChange={(e) => setData('booking_date', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" />
                                {errors.booking_date && <p className="text-sale text-[10px] mt-1">{errors.booking_date}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Time slot</label>
                                <select value={data.time_slot} onChange={(e) => setData('time_slot', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white">
                                    <option value="">Select a slot…</option>
                                    {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.time_slot && <p className="text-sale text-[10px] mt-1">{errors.time_slot}</p>}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Full name</label>
                                <input type="text" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" placeholder="Jane Doe" />
                                {errors.customer_name && <p className="text-sale text-[10px] mt-1">{errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Email</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" placeholder="jane@email.com" />
                                {errors.email && <p className="text-sale text-[10px] mt-1">{errors.email}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Phone (optional)</label>
                            <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" placeholder="+27 …" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-subtle uppercase mb-2">Notes (optional)</label>
                            <textarea rows="3" value={data.notes} onChange={(e) => setData('notes', e.target.value)}
                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" placeholder="Describe the issue…" />
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full py-3.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold rounded-full transition-colors">
                            {processing ? 'Booking…' : 'Confirm booking'}
                        </button>
                        <p className="text-[10px] text-subtle text-center flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" /> A confirmation is sent by email once your booking is received.
                        </p>
                    </form>
                </div>
            </section>

            {/* Terms & Conditions */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                <h2 className="text-lg font-extrabold text-heading dark:text-white tracking-tight mb-4">Terms &amp; Conditions</h2>
                <ul className="space-y-3 text-xs text-muted dark:text-subtle leading-relaxed list-disc pl-5">
                    <li>Repairs may affect any existing warranty or trade-in value on your device.</li>
                    <li>A device may be disqualified from repair for a bent chassis, multiple simultaneous issues, or cracked rear housing glass.</li>
                    <li>A flat levy applies to ineligible-damage devices to restore them to standard condition before repair.</li>
                    <li>All repairs require a restore, which wipes existing content — please back up beforehand.</li>
                    <li>Repairs carry a workmanship warranty of 90 days, or the remainder of the original warranty, whichever is longer.</li>
                </ul>
                <p className="text-[10px] text-subtle mt-6">
                    This is a summary. The full{' '}
                    <Link href="/terms" className="text-brand font-semibold">repair and service terms and conditions</Link>
                    {' '}apply to every device booked in and are confirmed with you at drop-off.
                </p>
            </section>
        </StorefrontLayout>
    );
}
