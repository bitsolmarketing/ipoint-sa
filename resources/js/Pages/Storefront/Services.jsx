import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
    ShieldCheck, XCircle, Check, CloudUpload, LockKeyhole, BatteryFull,
    Store, Truck, Clock, ChevronRight,
} from 'lucide-react';

const rand = (n) => `R${Number(n).toLocaleString('en-US')}`;

const PREP_STEPS = [
    {
        icon: CloudUpload,
        title: 'Back up your product',
        body: 'During the repair process your device needs to be re-calibrated. This wipes all of the content currently on it, so creating a backup ensures you can restore everything exactly as you had it.',
    },
    {
        icon: LockKeyhole,
        title: 'Sign out of iCloud',
        body: 'During the repair process your device will be restored. In order to do this, we require your device to be signed out of iCloud with Find My deactivated.',
    },
    {
        icon: BatteryFull,
        title: 'Fully charge your product',
        body: 'During the repair process your device needs to be fully charged so we can run a diagnostic report and determine whether it, or any of its components, are fully functional.',
    },
];

export default function Services({ products = [], ineligibleLevy = 750, locationCount = 0 }) {
    const [productKey, setProductKey] = useState('');
    const [modelName, setModelName] = useState('');
    const [variant, setVariant] = useState('');
    const [repairKey, setRepairKey] = useState('');

    const product = useMemo(
        () => products.find((p) => p.key === productKey) || null,
        [products, productKey],
    );

    const model = useMemo(
        () => (product ? product.models.find((m) => m.name === modelName) || null : null),
        [product, modelName],
    );

    const repair = useMemo(
        () => (model ? model.repairs.find((r) => r.key === repairKey) || null : null),
        [model, repairKey],
    );

    // Each step in the cascade invalidates everything downstream of it.
    const chooseProduct = (key) => {
        setProductKey(key);
        setModelName('');
        setVariant('');
        setRepairKey('');
    };

    const chooseModel = (name) => {
        setModelName(name);
        setVariant('');
        setRepairKey('');
    };

    const bookingHref = (mode) => {
        const params = new URLSearchParams({ mode });
        if (repair) params.set('type', repair.key);
        if (model) params.set('model', model.name);
        if (variant) params.set('variant', variant);
        return `/apple-product-repair?${params.toString()}#book`;
    };

    const readyToBook = Boolean(model && repair);
    const heroImages = products.slice(0, 4);

    return (
        <StorefrontLayout>
            <Head title="Repairs & Services — iPoint" />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="bg-white dark:bg-[#1D1D1F] px-4 sm:px-6 md:px-8 pt-16 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[10px] font-bold text-[#0066CC] uppercase tracking-widest">iPoint Service Centre</span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-3 leading-tight">
                        Professional repairs and technical support for Apple products
                    </h1>

                    {/* Device line-up */}
                    <div className="flex items-end justify-center gap-3 sm:gap-6 mt-10 mb-10">
                        {heroImages.map((p) => (
                            <img
                                key={p.key}
                                src={p.image}
                                alt={p.label}
                                loading="lazy"
                                className="h-20 sm:h-32 md:h-40 w-auto object-contain rounded-2xl"
                            />
                        ))}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
                        <span className="font-bold text-[#1D1D1F] dark:text-white">iPoint</span> offers professional repairs on a
                        selected range of Apple products. These repairs are carried out at our Service Centres, which handle small
                        to large scale repairs as well as unit replacements. All repairs use genuine parts so your product&rsquo;s
                        warranty and trade-in value are retained, and so it works exactly the way it&rsquo;s supposed to. Simply
                        book a technical appointment below to have your product assessed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                        <a
                            href={bookingHref('in_store')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white text-sm font-bold px-8 py-3.5 rounded-full transition-colors"
                        >
                            <Store className="w-4 h-4" /> Book in-store appointment
                        </a>
                        <a
                            href={bookingHref('home_collection')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white text-sm font-bold px-8 py-3.5 rounded-full transition-colors"
                        >
                            <Truck className="w-4 h-4" /> Book home collection
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Eligible vs ineligible ───────────────────────────── */}
            <section className="bg-[#F5F5F7] dark:bg-[#151516] px-4 sm:px-6 md:px-8 py-20">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">
                        Screen, battery and other repairs.
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                        A full range of repairs available at iPoint.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
                        <div className="bg-white dark:bg-[#1D1D1F] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <ShieldCheck className="w-5 h-5" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Eligible repairs</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                                Eligible repairs can be carried out on devices damaged by forms of accidental damage, which are
                                limited to LCD fractures and glass fractures, or damage caused by defects in materials and/or
                                workmanship.
                            </p>
                            <ul className="mt-5 space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
                                {['LCD fractures', 'Glass fractures', 'Defects in materials or workmanship'].map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-[#1D1D1F] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-[#E30000]">
                                <XCircle className="w-5 h-5" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Ineligible repairs</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                                Ineligible repairs apply to devices that have any 3rd party, missing or disassembled components,
                                intentional tampering or catastrophic damage. A{' '}
                                <span className="font-bold text-[#E30000]">{rand(ineligibleLevy)}</span> additional levy is applied
                                to restore your device back to a serviceable condition.
                            </p>
                            <ul className="mt-5 space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
                                {['3rd party, missing or disassembled components', 'Intentional tampering', 'Catastrophic damage'].map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <XCircle className="w-4 h-4 text-[#E30000] flex-shrink-0 mt-0.5" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-10">T&amp;Cs apply.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
                        Eligible devices purchased from outside of South Africa cannot be serviced in store and will need to be sent
                        away to the central service centre. This is applicable to all hardware repairs and includes screens and
                        batteries.
                    </p>
                </div>
            </section>

            {/* ── Repair selector ──────────────────────────────────── */}
            <section id="repair-selector" className="bg-white dark:bg-[#1D1D1F] px-4 sm:px-6 md:px-8 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">
                            Professional repairs and technical support
                            {product ? ` for ${product.label}` : ''}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                            We offer same-day battery and display repairs at selected iPoint stores. Please book your repair.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
                        {/* Selector */}
                        <div className="bg-[#F5F5F7] dark:bg-[#151516] rounded-3xl p-8">
                            <h3 className="text-xl font-extrabold text-[#1D1D1F] dark:text-white text-center">
                                Need {product ? product.label : 'device'} support
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Here&rsquo;s a list of our {product ? product.label : 'repair'} services
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                                Select your device and service required below.
                            </p>

                            <div className="space-y-3 mt-7">
                                <select
                                    value={productKey}
                                    onChange={(e) => chooseProduct(e.target.value)}
                                    aria-label="Choose product"
                                    className="w-full text-sm font-semibold text-center border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 bg-white dark:bg-[#1D1D1F] text-gray-900 dark:text-white focus:ring-[#0066CC] focus:border-[#0066CC]"
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map((p) => (
                                        <option key={p.key} value={p.key}>{p.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={modelName}
                                    onChange={(e) => chooseModel(e.target.value)}
                                    disabled={!product}
                                    aria-label="Choose model"
                                    className="w-full text-sm font-semibold text-center border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 bg-white dark:bg-[#1D1D1F] text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-[#0066CC] focus:border-[#0066CC]"
                                >
                                    <option value="">-- Choose Model --</option>
                                    {product?.models.map((m) => (
                                        <option key={m.name} value={m.name}>{m.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={variant}
                                    onChange={(e) => setVariant(e.target.value)}
                                    disabled={!model}
                                    aria-label={`Choose ${product ? product.variant_label.toLowerCase() : 'storage'}`}
                                    className="w-full text-sm font-semibold text-center border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 bg-white dark:bg-[#1D1D1F] text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-[#0066CC] focus:border-[#0066CC]"
                                >
                                    <option value="">-- Choose {product ? product.variant_label : 'Storage'} --</option>
                                    {model?.variants.map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>

                                <select
                                    value={repairKey}
                                    onChange={(e) => setRepairKey(e.target.value)}
                                    disabled={!model}
                                    aria-label="Choose repair type"
                                    className="w-full text-sm font-semibold text-center border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 bg-white dark:bg-[#1D1D1F] text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-[#0066CC] focus:border-[#0066CC]"
                                >
                                    <option value="">-- Choose Repair Type --</option>
                                    {model?.repairs.map((r) => (
                                        <option key={r.key} value={r.key}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Device visual */}
                        <div className="flex items-center justify-center py-6">
                            {product ? (
                                <img
                                    src={product.image}
                                    alt={model ? model.name : product.label}
                                    className="max-h-72 w-auto object-contain rounded-3xl"
                                />
                            ) : (
                                <div className="text-center text-gray-300 dark:text-gray-700">
                                    <Store className="w-20 h-20 mx-auto" />
                                    <p className="text-xs mt-3">Choose a product to begin</p>
                                </div>
                            )}
                        </div>

                        {/* Price + booking */}
                        <div className="bg-[#F5F5F7] dark:bg-[#151516] rounded-3xl p-8 flex flex-col justify-center text-center">
                            {repair ? (
                                <>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {repair.label}
                                    </p>
                                    <p className="text-4xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-2">
                                        {rand(repair.price)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {model.name}{variant ? ` · ${variant}` : ''}
                                    </p>
                                    {repair.same_day && (
                                        <p className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30 rounded-full px-3 py-1.5 mt-4 mx-auto">
                                            <Clock className="w-3 h-3" /> Same-day available at select stores
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                                    Select your device and repair type to see an indicative price.
                                </p>
                            )}

                            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 mt-7">
                                <a
                                    href={readyToBook ? bookingHref('in_store') : undefined}
                                    aria-disabled={!readyToBook}
                                    className={`flex-1 text-center text-xs font-bold px-5 py-3 rounded-full transition-colors ${
                                        readyToBook
                                            ? 'bg-[#0066CC] hover:bg-[#0077ED] text-white'
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    Book appointment
                                </a>
                                <a
                                    href={readyToBook ? bookingHref('home_collection') : undefined}
                                    aria-disabled={!readyToBook}
                                    className={`flex-1 text-center text-xs font-bold px-5 py-3 rounded-full transition-colors ${
                                        readyToBook
                                            ? 'bg-[#0066CC] hover:bg-[#0077ED] text-white'
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    Book collection
                                </a>
                            </div>

                            <p className="text-[10px] text-[#E30000] leading-relaxed mt-5">
                                *Subject to part availability on assessment.<br />
                                *Price displayed is indicative only, subject to assessment, part retention, and change without notice.
                            </p>
                        </div>
                    </div>

                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 text-center mt-10">
                        Same day battery and screen replacements available at select stores
                        {locationCount > 0 ? ` — ${locationCount} service ${locationCount === 1 ? 'location' : 'locations'} nationwide.` : '.'}
                    </p>
                </div>
            </section>

            {/* ── Prep steps ───────────────────────────────────────── */}
            <section className="bg-white dark:bg-[#1D1D1F] px-4 sm:px-6 md:px-8 pb-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">
                        Here&rsquo;s how to get your Apple device ready for its big day.
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                        Steps to follow before handing in your device.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
                        {PREP_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.title}>
                                    <span className="w-12 h-12 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-lg font-extrabold flex items-center justify-center mx-auto">
                                        {i + 1}
                                    </span>
                                    <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white mt-6 flex items-center justify-center gap-2">
                                        <Icon className="w-4 h-4 text-gray-400" /> {step.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                                        {step.body}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Terms & conditions ───────────────────────────────── */}
            <section className="bg-[#F5F5F7] dark:bg-[#151516] px-4 sm:px-6 md:px-8 py-14">
                <div className="max-w-5xl mx-auto space-y-4">
                    <h2 className="text-xs font-bold text-gray-600 dark:text-gray-300">Terms and Conditions</h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed">
                        Devices with the following damage will not qualify for a screen replacement: the housing cannot be damaged
                        severely (light dents and scratches are okay), the device cannot be bent, the device cannot have multiple
                        issues (i.e. not only is the screen damaged but the device no longer switches on or has water damage too),
                        rear housing glass cracked or smashed. The costs quoted apply to devices with &lsquo;eligible&rsquo; damage.
                        Eligible damage is defined as damage caused by defects in materials or workmanship and some forms of
                        accidental damage, which are limited to liquid damage, LCD fractures and glass fractures. iPoint will still
                        offer repairs to devices with ineligible damage at an additional levy of {rand(ineligibleLevy)}. A device
                        with any of the following conditions is ineligible for out-of-warranty service: third party display, missing
                        display, intentional tampering, missing or disassembled parts of the display and catastrophic damage.
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed">
                        Customers booking in their device for a screen replacement must back up their device, turn Find My off and
                        ensure the device has been charged or is able to switch on at time of booking it in, in order to run
                        diagnostics. It is imperative that your device is backed up prior to requesting a screen replacement service,
                        as the device will be restored to factory settings and all data will be wiped as part of this repair
                        procedure. The screen repair includes a 90 day warranty or the remainder of your warranty period, whichever
                        is longer.
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed">
                        iPoint levies a charge on returns of unsealed products to cover the costs of repackaging the product for
                        sale. You will only be eligible for a refund if the product is returned to iPoint together with all its
                        accessories, the original product packaging and original tax invoice, and subject to an internal inspection
                        of the product at our Service Centre. This excludes any bulk deals over five units — iPoint will not
                        facilitate any bulk deal returns. All faulty products are covered by the relevant product warranty.
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 pt-2">
                        Questions about a repair already booked?{' '}
                        <Link href="/contact" className="text-[#0066CC] font-semibold inline-flex items-center gap-0.5">
                            Contact us <ChevronRight className="w-3 h-3" />
                        </Link>
                    </p>
                </div>
            </section>
        </StorefrontLayout>
    );
}
