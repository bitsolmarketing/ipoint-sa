import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Wrench, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Zap, Clock,
    Smartphone, Settings2, DownloadCloud, Save, ListChecks,
} from 'lucide-react';
import InputError from '@/Components/InputError';
import ImageUploader from '@/Components/Admin/ImageUploader';

const inputClass =
    'w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white';
const labelClass = 'block text-[10px] font-bold text-gray-400 uppercase mb-1.5';
const btnPrimary =
    'px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold rounded-full inline-flex items-center gap-1.5';
const btnGhost =
    'px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center gap-1.5';

function Modal({ title, onClose, children, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
            <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden font-sans max-h-[92vh] overflow-y-auto`}>
                <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

/** Repeatable list of short strings — used for model variants and time slots. */
function StringListEditor({ values, onChange, placeholder, addLabel }) {
    return (
        <div className="space-y-2">
            {values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            const next = [...values];
                            next[index] = e.target.value;
                            onChange(next);
                        }}
                        className={inputClass}
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={() => onChange(values.filter((_, i) => i !== index))}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#E30000] flex-shrink-0"
                        title="Remove"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange([...values, ''])}
                className="text-[11px] font-semibold text-[#0066CC] hover:underline inline-flex items-center gap-1"
            >
                <Plus className="w-3 h-3" /> {addLabel}
            </button>
        </div>
    );
}

export default function Catalogue({ types, devices, options, isSeeded }) {
    const [openDevice, setOpenDevice] = useState(devices[0]?.id ?? null);
    const [typeModal, setTypeModal] = useState(null);     // null | {} | type
    const [deviceModal, setDeviceModal] = useState(null);
    const [modelModal, setModelModal] = useState(null);   // { deviceId, model? }

    const activeTypes = types.filter((t) => t.is_active);

    // ----------------------------------------------------------- repair types
    const typeForm = useForm({ label: '', description: '', is_same_day: false, is_active: true, sort_order: 0 });

    const openTypeModal = (type = null) => {
        typeForm.clearErrors();
        typeForm.setData(
            type
                ? {
                      label: type.label,
                      description: type.description || '',
                      is_same_day: !!type.is_same_day,
                      is_active: !!type.is_active,
                      sort_order: type.sort_order ?? 0,
                  }
                : { label: '', description: '', is_same_day: false, is_active: true, sort_order: types.length }
        );
        setTypeModal(type || {});
    };

    const submitType = (e) => {
        e.preventDefault();
        const onSuccess = () => setTypeModal(null);

        if (typeModal?.id) {
            typeForm.put(route('admin.repairs.types.update', typeModal.id), { onSuccess, preserveScroll: true });
        } else {
            typeForm.post(route('admin.repairs.types.store'), { onSuccess, preserveScroll: true });
        }
    };

    const deleteType = (type) => {
        if (confirm(`Remove "${type.label}"? Prices for this repair are removed from every model.`)) {
            router.delete(route('admin.repairs.types.destroy', type.id), { preserveScroll: true });
        }
    };

    // --------------------------------------------------------------- devices
    const deviceForm = useForm({ label: '', variant_label: 'Storage', image_path: '', is_active: true, sort_order: 0 });

    const openDeviceModal = (device = null) => {
        deviceForm.clearErrors();
        deviceForm.setData(
            device
                ? {
                      label: device.label,
                      variant_label: device.variant_label,
                      image_path: device.image_path || '',
                      is_active: !!device.is_active,
                      sort_order: device.sort_order ?? 0,
                  }
                : { label: '', variant_label: 'Storage', image_path: '', is_active: true, sort_order: devices.length }
        );
        setDeviceModal(device || {});
    };

    const submitDevice = (e) => {
        e.preventDefault();
        const onSuccess = () => setDeviceModal(null);

        if (deviceModal?.id) {
            deviceForm.put(route('admin.repairs.devices.update', deviceModal.id), { onSuccess, preserveScroll: true });
        } else {
            deviceForm.post(route('admin.repairs.devices.store'), { onSuccess, preserveScroll: true });
        }
    };

    const deleteDevice = (device) => {
        if (confirm(`Remove "${device.label}" and all of its models and prices?`)) {
            router.delete(route('admin.repairs.devices.destroy', device.id), { preserveScroll: true });
        }
    };

    // ---------------------------------------------------------------- models
    const modelForm = useForm({
        repair_device_id: '',
        name: '',
        variants: [],
        is_active: true,
        sort_order: 0,
        prices: {},
    });

    const openModelModal = (deviceId, model = null) => {
        modelForm.clearErrors();

        // Price grid is keyed by repair type id; a blank cell means "not offered".
        const prices = {};
        types.forEach((type) => {
            const existing = model?.prices?.find((p) => p.repair_type_id === type.id);
            prices[type.id] = existing ? String(existing.price).replace(/\.00$/, '') : '';
        });

        modelForm.setData({
            repair_device_id: deviceId,
            name: model?.name || '',
            variants: model?.variants || [],
            is_active: model ? !!model.is_active : true,
            sort_order: model?.sort_order ?? 0,
            prices,
        });

        setModelModal({ deviceId, model });
    };

    const submitModel = (e) => {
        e.preventDefault();
        const onSuccess = () => setModelModal(null);

        if (modelModal?.model?.id) {
            modelForm.put(route('admin.repairs.models.update', modelModal.model.id), { onSuccess, preserveScroll: true });
        } else {
            modelForm.post(route('admin.repairs.models.store'), { onSuccess, preserveScroll: true });
        }
    };

    const deleteModel = (model) => {
        if (confirm(`Remove "${model.name}" and its prices?`)) {
            router.delete(route('admin.repairs.models.destroy', model.id), { preserveScroll: true });
        }
    };

    // --------------------------------------------------------------- options
    const optionsForm = useForm({
        ineligible_levy: options.ineligible_levy ?? 750,
        time_slots: options.time_slots || [],
        offer_in_store: options.offer_in_store !== false,
        offer_home_collection: options.offer_home_collection !== false,
        home_collection_fee: options.home_collection_fee ?? 0,
        turnaround_note: options.turnaround_note || '',
        disclaimer: options.disclaimer || '',
        booking_enabled: options.booking_enabled !== false,
    });

    const submitOptions = (e) => {
        e.preventDefault();
        optionsForm.post(route('admin.repairs.options.update'), { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Repair Catalogue" />

            <div className="space-y-6 font-sans">
                {/* Header */}
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-[#0066CC]" />
                            Repair Catalogue
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Device categories, models, repair types and prices behind the repair booking and price selector.
                        </p>
                    </div>

                    <Link href={route('admin.repairs.index')} className={btnGhost}>
                        <ListChecks className="w-3.5 h-3.5" />
                        Bookings &amp; locations
                    </Link>
                </div>

                {!isSeeded && (
                    <div className="bg-[#0066CC]/5 border border-[#0066CC]/20 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Your catalogue is empty</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                The storefront is showing the built-in starter list. Import it here to start editing, or add your
                                own device categories below.
                            </p>
                        </div>
                        <button onClick={() => router.post(route('admin.repairs.seed'))} className={btnPrimary}>
                            <DownloadCloud className="w-3.5 h-3.5" />
                            Import starter catalogue
                        </button>
                    </div>
                )}

                {/* Repair types */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Repair types</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">What you fix. Each one can be priced per model below.</p>
                        </div>
                        <button onClick={() => openTypeModal()} className={btnPrimary}>
                            <Plus className="w-4 h-4" /> Add type
                        </button>
                    </div>

                    <div className="p-4 flex flex-wrap gap-2">
                        {types.length === 0 && (
                            <p className="text-xs text-gray-400 px-2 py-4">No repair types yet. Add one to start pricing repairs.</p>
                        )}
                        {types.map((type) => (
                            <div
                                key={type.id}
                                className={`group flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-2xl border text-xs ${
                                    type.is_active
                                        ? 'border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-850'
                                        : 'border-dashed border-gray-200 dark:border-gray-700 opacity-60'
                                }`}
                            >
                                <span className="font-bold text-gray-800 dark:text-gray-200">{type.label}</span>

                                {type.is_same_day && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                        <Zap className="w-2.5 h-2.5" /> Same day
                                    </span>
                                )}
                                {!type.is_active && (
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500">
                                        Off
                                    </span>
                                )}

                                <button onClick={() => openTypeModal(type)} className="p-1 rounded-lg text-gray-400 hover:text-[#0066CC]" title="Edit">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteType(type)} className="p-1 rounded-lg text-gray-400 hover:text-[#E30000]" title="Remove">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Devices + models */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Device categories &amp; models</h2>
                        <button onClick={() => openDeviceModal()} className={btnPrimary}>
                            <Plus className="w-4 h-4" /> Add device category
                        </button>
                    </div>

                    {devices.length === 0 && (
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl py-12 text-center text-xs text-gray-400">
                            No device categories yet — add one (iPhone, iPad, Mac…) to start building your catalogue.
                        </div>
                    )}

                    {devices.map((device) => {
                        const isOpen = openDevice === device.id;

                        return (
                            <div key={device.id} className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-4 px-6 py-4">
                                    <button
                                        onClick={() => setOpenDevice(isOpen ? null : device.id)}
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                    >
                                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-850 flex items-center justify-center flex-shrink-0">
                                            {device.image_path ? (
                                                <img src={device.image_path} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Smartphone className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{device.label}</span>
                                                {!device.is_active && (
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                                                        Hidden
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {device.models.length} model{device.models.length === 1 ? '' : 's'} · variant label “{device.variant_label}”
                                            </p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => openDeviceModal(device)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#0066CC]" title="Edit category">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteDevice(device)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E30000]" title="Remove category">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setOpenDevice(isOpen ? null : device.id)} className="p-1.5 rounded-lg text-gray-400">
                                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-50 dark:border-gray-800">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider">
                                                        <th className="py-3 px-6 font-semibold">Model</th>
                                                        <th className="py-3 px-4 font-semibold">{device.variant_label}</th>
                                                        {activeTypes.map((type) => (
                                                            <th key={type.id} className="py-3 px-3 font-semibold text-center whitespace-nowrap">
                                                                {type.label}
                                                            </th>
                                                        ))}
                                                        <th className="py-3 px-4 font-semibold text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-gray-855">
                                                    {device.models.length === 0 && (
                                                        <tr>
                                                            <td colSpan={activeTypes.length + 3} className="py-8 text-center text-gray-400">
                                                                No models yet for {device.label}.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {device.models.map((model) => (
                                                        <tr key={model.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/10 ${model.is_active ? '' : 'opacity-50'}`}>
                                                            <td className="py-3 px-6 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                                {model.name}
                                                                {!model.is_active && <span className="ml-1.5 text-[9px] font-bold uppercase text-gray-400">Hidden</span>}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-500">
                                                                {(model.variants || []).join(' · ') || <span className="text-gray-300">—</span>}
                                                            </td>
                                                            {activeTypes.map((type) => {
                                                                const price = model.prices?.find((p) => p.repair_type_id === type.id);
                                                                return (
                                                                    <td key={type.id} className="py-3 px-3 text-center whitespace-nowrap">
                                                                        {price ? (
                                                                            <span className="font-mono text-gray-700 dark:text-gray-300">
                                                                                R {Number(price.price).toLocaleString('en-ZA')}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-gray-300 dark:text-gray-700">—</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button onClick={() => openModelModal(device.id, model)} className="p-1 rounded-full text-gray-400 hover:text-[#0066CC]" title="Edit model & prices">
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => deleteModel(model)} className="p-1 rounded-full text-gray-400 hover:text-[#E30000]" title="Remove model">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="px-6 py-3 border-t border-gray-50 dark:border-gray-800">
                                            <button
                                                onClick={() => openModelModal(device.id)}
                                                className="text-[11px] font-semibold text-[#0066CC] hover:underline inline-flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add a model to {device.label}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Service options */}
                <form onSubmit={submitOptions} className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-[#0066CC]" />
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Service options</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">How bookings are taken and what customers are told.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Failed-inspection levy (R)</label>
                                    <input type="number" min="0" step="1" value={optionsForm.data.ineligible_levy} onChange={(e) => optionsForm.setData('ineligible_levy', e.target.value)} className={inputClass} />
                                    <p className="text-[10px] text-gray-400 mt-1">Charged when a device fails the eligibility check.</p>
                                    <InputError message={optionsForm.errors.ineligible_levy} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Home collection fee (R)</label>
                                    <input type="number" min="0" step="1" value={optionsForm.data.home_collection_fee} onChange={(e) => optionsForm.setData('home_collection_fee', e.target.value)} className={inputClass} />
                                    <p className="text-[10px] text-gray-400 mt-1">Set 0 for free collection.</p>
                                    <InputError message={optionsForm.errors.home_collection_fee} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Turnaround note</label>
                                <input type="text" value={optionsForm.data.turnaround_note} onChange={(e) => optionsForm.setData('turnaround_note', e.target.value)} className={inputClass} />
                                <InputError message={optionsForm.errors.turnaround_note} className="mt-1" />
                            </div>

                            <div>
                                <label className={labelClass}>Pricing disclaimer</label>
                                <input type="text" value={optionsForm.data.disclaimer} onChange={(e) => optionsForm.setData('disclaimer', e.target.value)} className={inputClass} />
                                <InputError message={optionsForm.errors.disclaimer} className="mt-1" />
                            </div>

                            <div className="flex flex-wrap gap-5 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={optionsForm.data.booking_enabled} onChange={(e) => optionsForm.setData('booking_enabled', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                    Accept online bookings
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={optionsForm.data.offer_in_store} onChange={(e) => optionsForm.setData('offer_in_store', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                    Offer in-store appointments
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={optionsForm.data.offer_home_collection} onChange={(e) => optionsForm.setData('offer_home_collection', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                    Offer home collection
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Bookable time slots</span>
                            </label>
                            <StringListEditor
                                values={optionsForm.data.time_slots}
                                onChange={(next) => optionsForm.setData('time_slots', next)}
                                placeholder="09:00 – 11:00"
                                addLabel="Add slot"
                            />
                            <InputError message={optionsForm.errors.time_slots} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={optionsForm.processing} className={btnPrimary}>
                            <Save className="w-3.5 h-3.5" />
                            {optionsForm.processing ? 'Saving…' : 'Save options'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Repair type modal --- */}
            {typeModal && (
                <Modal title={typeModal.id ? 'Edit repair type' : 'Add repair type'} onClose={() => setTypeModal(null)}>
                    <form onSubmit={submitType} className="p-6 space-y-4">
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input type="text" value={typeForm.data.label} onChange={(e) => typeForm.setData('label', e.target.value)} className={inputClass} placeholder="e.g. Speaker replacement" required />
                            <InputError message={typeForm.errors.label} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea rows={2} value={typeForm.data.description} onChange={(e) => typeForm.setData('description', e.target.value)} className={inputClass} placeholder="Shown on the repair categories section." />
                            <InputError message={typeForm.errors.description} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Display order</label>
                            <input type="number" min="0" value={typeForm.data.sort_order} onChange={(e) => typeForm.setData('sort_order', e.target.value)} className={inputClass} />
                            <InputError message={typeForm.errors.sort_order} className="mt-1" />
                        </div>

                        <div className="flex flex-wrap gap-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={typeForm.data.is_same_day} onChange={(e) => typeForm.setData('is_same_day', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                Same-day turnaround
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={typeForm.data.is_active} onChange={(e) => typeForm.setData('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                Active
                            </label>
                        </div>

                        {typeModal.id && (
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                The internal key stays as <span className="font-mono">{typeModal.key}</span> so existing bookings keep
                                resolving. Renaming here only changes what customers see.
                            </p>
                        )}

                        <div className="pt-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setTypeModal(null)} className={btnGhost}>Cancel</button>
                            <button type="submit" disabled={typeForm.processing} className={btnPrimary}>
                                {typeForm.processing ? 'Saving…' : 'Save type'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* --- Device modal --- */}
            {deviceModal && (
                <Modal title={deviceModal.id ? 'Edit device category' : 'Add device category'} onClose={() => setDeviceModal(null)}>
                    <form onSubmit={submitDevice} className="p-6 space-y-4">
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input type="text" value={deviceForm.data.label} onChange={(e) => deviceForm.setData('label', e.target.value)} className={inputClass} placeholder="e.g. iPhone" required />
                            <InputError message={deviceForm.errors.label} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Variant label *</label>
                            <input type="text" value={deviceForm.data.variant_label} onChange={(e) => deviceForm.setData('variant_label', e.target.value)} className={inputClass} placeholder="Storage / Case size / Configuration" required />
                            <p className="text-[10px] text-gray-400 mt-1">What the second selector is called on the price page.</p>
                            <InputError message={deviceForm.errors.variant_label} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Category image</label>
                            <ImageUploader
                                value={deviceForm.data.image_path}
                                onChange={(url) => deviceForm.setData('image_path', url)}
                                folder="repairs"
                                aspect="aspect-[3/2]"
                                hint="Square or landscape product shot."
                                error={deviceForm.errors.image_path}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Display order</label>
                            <input type="number" min="0" value={deviceForm.data.sort_order} onChange={(e) => deviceForm.setData('sort_order', e.target.value)} className={inputClass} />
                            <InputError message={deviceForm.errors.sort_order} className="mt-1" />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                            <input type="checkbox" checked={deviceForm.data.is_active} onChange={(e) => deviceForm.setData('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                            Show on the storefront
                        </label>

                        <div className="pt-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setDeviceModal(null)} className={btnGhost}>Cancel</button>
                            <button type="submit" disabled={deviceForm.processing} className={btnPrimary}>
                                {deviceForm.processing ? 'Saving…' : 'Save category'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* --- Model + price grid modal --- */}
            {modelModal && (
                <Modal title={modelModal.model ? `Edit ${modelModal.model.name}` : 'Add model'} onClose={() => setModelModal(null)} wide>
                    <form onSubmit={submitModel} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Model name *</label>
                                <input type="text" value={modelForm.data.name} onChange={(e) => modelForm.setData('name', e.target.value)} className={inputClass} placeholder="e.g. iPhone 16 Pro Max" required />
                                <InputError message={modelForm.errors.name} className="mt-1" />
                            </div>

                            <div>
                                <label className={labelClass}>Variants</label>
                                <StringListEditor
                                    values={modelForm.data.variants}
                                    onChange={(next) => modelForm.setData('variants', next)}
                                    placeholder="e.g. 256GB"
                                    addLabel="Add variant"
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5">Storage sizes, case sizes or configurations the customer picks from.</p>
                                <InputError message={modelForm.errors.variants} className="mt-1" />
                            </div>

                            <div>
                                <label className={labelClass}>Display order</label>
                                <input type="number" min="0" value={modelForm.data.sort_order} onChange={(e) => modelForm.setData('sort_order', e.target.value)} className={inputClass} />
                                <InputError message={modelForm.errors.sort_order} className="mt-1" />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={modelForm.data.is_active} onChange={(e) => modelForm.setData('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                Show on the storefront
                            </label>
                        </div>

                        <div>
                            <label className={labelClass}>Repair prices (R)</label>
                            <div className="space-y-2 border border-gray-100 dark:border-gray-800 rounded-2xl p-3">
                                {types.length === 0 && (
                                    <p className="text-[11px] text-gray-400 py-2">Add a repair type first to price it here.</p>
                                )}
                                {types.map((type) => (
                                    <div key={type.id} className="flex items-center gap-3">
                                        <span className={`flex-1 text-[11px] font-semibold ${type.is_active ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 line-through'}`}>
                                            {type.label}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={modelForm.data.prices[type.id] ?? ''}
                                            onChange={(e) =>
                                                modelForm.setData('prices', { ...modelForm.data.prices, [type.id]: e.target.value })
                                            }
                                            className="w-28 text-xs border border-gray-200 dark:border-gray-800 rounded-lg px-2.5 py-1.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white font-mono"
                                            placeholder="—"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                                Leave a price blank when you don't offer that repair on this model — it is then hidden from the
                                customer's options.
                            </p>
                        </div>

                        <div className="md:col-span-2 pt-2 flex justify-end gap-3 border-t border-gray-50 dark:border-gray-800">
                            <button type="button" onClick={() => setModelModal(null)} className={`${btnGhost} mt-4`}>Cancel</button>
                            <button type="submit" disabled={modelForm.processing} className={`${btnPrimary} mt-4`}>
                                {modelForm.processing ? 'Saving…' : 'Save model'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AdminLayout>
    );
}
