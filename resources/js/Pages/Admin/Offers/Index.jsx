import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus, Pencil, Trash2, X, Eye, EyeOff, ExternalLink, ArrowUp, ArrowDown,
    Copy, Sparkles, Settings2, ArrowRight,
} from 'lucide-react';
import InputError from '@/Components/InputError';
import ImageUploader from '@/Components/Admin/ImageUploader';

const inputClass =
    'w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white';
const labelClass = 'block text-[10px] font-bold text-gray-400 uppercase mb-1.5';

const BLANK = {
    title: '',
    subtitle: '',
    description: '',
    badge_text: '',
    image_path: '',
    link_url: '',
    cta_label: '',
    overlay_style: 'gradient',
    sort_order: 0,
    is_active: true,
    start_date: '',
    end_date: '',
};

/** Mirrors the storefront card so the admin sees what shoppers will see. */
function OfferPreview({ offer }) {
    return (
        <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-150 dark:border-gray-800">
            {offer.image_path ? (
                <img src={offer.image_path} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                    Add artwork to see the preview
                </div>
            )}

            {offer.badge_text && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[#1d1d1f] text-[10px] font-extrabold shadow-sm">
                    {offer.badge_text}
                </span>
            )}

            {offer.overlay_style !== 'none' && (offer.title || offer.subtitle) && (
                <>
                    {offer.overlay_style === 'gradient' ? (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    ) : (
                        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-black/70 backdrop-blur-sm" />
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        {offer.title && <h3 className="text-sm font-extrabold text-white leading-tight">{offer.title}</h3>}
                        {offer.subtitle && <p className="text-[11px] text-white/80 mt-0.5 leading-snug">{offer.subtitle}</p>}
                        <span className="inline-flex items-center text-[10px] font-bold text-[#2997ff] mt-1.5">
                            {offer.cta_label || 'Shop offer'} <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Index({ offers, section }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editOffer, setEditOffer] = useState(null);
    const [sectionOpen, setSectionOpen] = useState(false);

    const { data, setData, post, put, reset, clearErrors, processing, errors } = useForm({ ...BLANK });

    const sectionForm = useForm({
        eyebrow: section.eyebrow || '',
        heading: section.heading || '',
        subheading: section.subheading || '',
        is_enabled: !!section.is_enabled,
    });

    const openAddModal = () => {
        reset();
        clearErrors();
        setData({ ...BLANK, sort_order: offers.length });
        setEditOffer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (offer) => {
        clearErrors();
        setEditOffer(offer);
        setData({
            title: offer.title || '',
            subtitle: offer.subtitle || '',
            description: offer.description || '',
            badge_text: offer.badge_text || '',
            image_path: offer.image_path || '',
            link_url: offer.link_url || '',
            cta_label: offer.cta_label || '',
            overlay_style: offer.overlay_style || 'gradient',
            sort_order: offer.sort_order ?? 0,
            is_active: !!offer.is_active,
            start_date: offer.start_date ? offer.start_date.substring(0, 10) : '',
            end_date: offer.end_date ? offer.end_date.substring(0, 10) : '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditOffer(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const onSuccess = () => closeModal();

        if (editOffer) {
            put(route('admin.offers.update', editOffer.id), { onSuccess });
        } else {
            post(route('admin.offers.store'), { onSuccess });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Delete this offer banner?')) {
            router.delete(route('admin.offers.destroy', id));
        }
    };

    const handleToggle = (id) => router.post(route('admin.offers.toggle', id), {}, { preserveScroll: true });

    const handleReorder = (id, direction) =>
        router.post(route('admin.offers.reorder', id), { direction }, { preserveScroll: true });

    const handleDuplicate = (id) => router.post(route('admin.offers.duplicate', id), {}, { preserveScroll: true });

    const submitSection = (e) => {
        e.preventDefault();
        sectionForm.post(route('admin.offers.section.update'), { preserveScroll: true });
    };

    const activeCount = offers.filter((o) => o.is_active).length;

    return (
        <AdminLayout>
            <Head title="Manage Offers" />

            <div className="space-y-6 font-sans">
                {/* Header */}
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#0066CC]" />
                            Latest Offers
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">
                            The homepage offers carousel — artwork, copy, order and scheduling.
                            {' '}<span className="font-semibold text-gray-500">{activeCount} of {offers.length} live.</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSectionOpen(!sectionOpen)}
                            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                            Section settings
                        </button>
                        <button
                            onClick={openAddModal}
                            className="bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Offer
                        </button>
                    </div>
                </div>

                {/* Section-level settings */}
                {sectionOpen && (
                    <form onSubmit={submitSection} className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 space-y-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Section heading</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">The copy that sits above the carousel on the homepage.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Eyebrow</label>
                                <input type="text" value={sectionForm.data.eyebrow} onChange={(e) => sectionForm.setData('eyebrow', e.target.value)} className={inputClass} placeholder="Deals & Promotions" />
                                <InputError message={sectionForm.errors.eyebrow} className="mt-1" />
                            </div>
                            <div>
                                <label className={labelClass}>Heading</label>
                                <input type="text" value={sectionForm.data.heading} onChange={(e) => sectionForm.setData('heading', e.target.value)} className={inputClass} placeholder="Latest offers." />
                                <InputError message={sectionForm.errors.heading} className="mt-1" />
                            </div>
                            <div>
                                <label className={labelClass}>Sub-heading</label>
                                <input type="text" value={sectionForm.data.subheading} onChange={(e) => sectionForm.setData('subheading', e.target.value)} className={inputClass} placeholder="Optional supporting line" />
                                <InputError message={sectionForm.errors.subheading} className="mt-1" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={sectionForm.data.is_enabled} onChange={(e) => sectionForm.setData('is_enabled', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                Show the offers section on the homepage
                            </label>

                            <button type="submit" disabled={sectionForm.processing} className="px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold rounded-full">
                                {sectionForm.processing ? 'Saving…' : 'Save section'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Offers table */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-6 font-semibold">Preview</th>
                                    <th className="py-3 px-6 font-semibold">Content</th>
                                    <th className="py-3 px-6 font-semibold">Link</th>
                                    <th className="py-3 px-6 font-semibold text-center">Order</th>
                                    <th className="py-3 px-6 font-semibold text-center">Schedule</th>
                                    <th className="py-3 px-6 font-semibold text-center">Status</th>
                                    <th className="py-3 px-6 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-855">
                                {offers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-gray-400">No offers yet. Add your first offer banner.</td>
                                    </tr>
                                )}
                                {offers.map((offer, index) => (
                                    <tr key={offer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                                        <td className="py-3 px-6">
                                            <div className="w-28 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-100 dark:border-gray-800">
                                                {offer.image_path && (
                                                    <img src={offer.image_path} alt={offer.title || 'Offer'} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {offer.title || <span className="text-gray-400 font-normal italic">Untitled</span>}
                                            </div>
                                            {offer.subtitle && <div className="text-[10px] text-gray-400 mt-0.5 max-w-xs truncate">{offer.subtitle}</div>}
                                            {offer.badge_text && (
                                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-500 uppercase">
                                                    {offer.badge_text}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-gray-500">
                                            {offer.link_url ? (
                                                <span className="inline-flex items-center gap-1 text-[#0066CC]"><ExternalLink className="w-3 h-3" />{offer.link_url}</span>
                                            ) : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleReorder(offer.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 rounded-lg text-gray-400 hover:text-[#0066CC] disabled:opacity-25 disabled:hover:text-gray-400"
                                                    title="Move up"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="font-mono text-gray-500 w-4 text-center">{index + 1}</span>
                                                <button
                                                    onClick={() => handleReorder(offer.id, 'down')}
                                                    disabled={index === offers.length - 1}
                                                    className="p-1 rounded-lg text-gray-400 hover:text-[#0066CC] disabled:opacity-25 disabled:hover:text-gray-400"
                                                    title="Move down"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-center text-[10px] text-gray-500">
                                            {offer.start_date || offer.end_date ? (
                                                <span>{(offer.start_date || '').substring(0, 10) || '…'} → {(offer.end_date || '').substring(0, 10) || '…'}</span>
                                            ) : <span className="text-gray-400">Always</span>}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <button
                                                onClick={() => handleToggle(offer.id)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    offer.is_active
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                }`}
                                                title="Toggle visibility"
                                            >
                                                {offer.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {offer.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => openEditModal(offer)} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDuplicate(offer.id)} className="p-1 rounded-full text-gray-400 hover:text-[#0066CC]" title="Duplicate">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(offer.id)} className="p-1 rounded-full text-gray-400 hover:text-[#E30000]" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Editor modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={closeModal} />
                    <div className="w-full max-w-4xl bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden font-sans max-h-[92vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {editOffer ? 'Edit Offer' : 'Create Offer'}
                            </h3>
                            <button onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: artwork + preview */}
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Offer artwork *</label>
                                    <ImageUploader
                                        value={data.image_path}
                                        onChange={(url) => setData('image_path', url)}
                                        folder="offers"
                                        aspect="aspect-[16/10]"
                                        hint="Landscape artwork works best — roughly 3:2. Up to 10 MB."
                                        error={errors.image_path}
                                    />
                                </div>

                                <div>
                                    <p className={labelClass}>Card preview</p>
                                    <OfferPreview offer={data} />
                                </div>
                            </div>

                            {/* Right: copy + behaviour */}
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Title</label>
                                    <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={inputClass} placeholder="e.g. Trade-In Bonus" />
                                    <InputError message={errors.title} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass}>Subtitle</label>
                                    <input type="text" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} className={inputClass} placeholder="e.g. Save up to R6 000 on your next iPhone" />
                                    <InputError message={errors.subtitle} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Badge</label>
                                        <input type="text" value={data.badge_text} onChange={(e) => setData('badge_text', e.target.value)} className={inputClass} placeholder="e.g. Limited" />
                                        <InputError message={errors.badge_text} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Button label</label>
                                        <input type="text" value={data.cta_label} onChange={(e) => setData('cta_label', e.target.value)} className={inputClass} placeholder="Shop offer" />
                                        <InputError message={errors.cta_label} className="mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Link URL</label>
                                    <input type="text" value={data.link_url} onChange={(e) => setData('link_url', e.target.value)} className={inputClass} placeholder="/category/iphone" />
                                    <InputError message={errors.link_url} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass}>Text overlay</label>
                                    <select value={data.overlay_style} onChange={(e) => setData('overlay_style', e.target.value)} className={inputClass}>
                                        <option value="gradient">Gradient scrim (default)</option>
                                        <option value="solid">Solid panel — for busy artwork</option>
                                        <option value="none">None — artwork only</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Choose “None” when the promo text is already baked into the image.
                                    </p>
                                    <InputError message={errors.overlay_style} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass}>Internal notes</label>
                                    <textarea rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} className={inputClass} placeholder="Not shown on the site — for your team." />
                                    <InputError message={errors.description} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Start date</label>
                                        <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className={inputClass} />
                                        <InputError message={errors.start_date} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>End date</label>
                                        <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className={inputClass} />
                                        <InputError message={errors.end_date} className="mt-1" />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                    Active (visible on site)
                                </label>
                            </div>

                            <div className="lg:col-span-2 pt-2 flex justify-end space-x-3 border-t border-gray-50 dark:border-gray-800">
                                <button type="button" onClick={closeModal} className="mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="mt-4 px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold rounded-full">
                                    {processing ? 'Saving...' : 'Save Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
