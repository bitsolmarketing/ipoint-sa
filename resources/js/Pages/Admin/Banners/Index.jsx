import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import InputError from '@/Components/InputError';

// Banner slots, labelled by where they actually appear in the homepage running order.
// Values must stay in sync with the `position` enum in AdminBannerController.
// `bento` and `whats_new` are legacy slots the current homepage no longer renders —
// kept so existing rows still edit/save, but flagged so nobody uploads into a dead slot.
const BANNER_POSITIONS = [
    { value: 'hero', label: '1. Hero Slideshow', hint: 'Wide 2:1 artwork — 1600×800 or larger. Cropped to fill, so keep key detail centred.' },
    { value: 'spotlight', label: '4. Promotional Banner #1', hint: 'Slim strip, about 3.2:1 — 1333×417. Shown full width below Latest Offers.' },
    { value: 'zigzag', label: '6. Promotional Banner #2', hint: 'Slim strip, about 3.2:1 — 1333×417. Shown above the accessories shelf.' },
    { value: 'footer', label: '8. Footer Banner (every page)', hint: 'Slim strip, about 3.2:1 — 1333×417. Appears above the footer links on every page.' },
    { value: 'bento', label: 'Bento grid (unused — not shown on homepage)', hint: 'Legacy slot. Nothing on the site renders it.' },
    { value: 'whats_new', label: "What's New shelf (unused — not shown on homepage)", hint: 'Legacy slot. Nothing on the site renders it.' },
];

const positionLabel = (value) =>
    BANNER_POSITIONS.find((pos) => pos.value === value)?.label ?? value;

const positionHint = (value) =>
    BANNER_POSITIONS.find((pos) => pos.value === value)?.hint ?? '';

export default function Index({ banners }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBanner, setEditBanner] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        title: '',
        subtitle: '',
        image_path: '',
        link_url: '',
        position: 'hero',
        sort_order: 0,
        is_active: true
    });

    const openAddModal = () => {
        reset();
        setEditBanner(null);
        setIsModalOpen(true);
    };

    const openEditModal = (banner) => {
        setEditBanner(banner);
        setData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            image_path: banner.image_path || '',
            link_url: banner.link_url || '',
            position: banner.position || 'hero',
            sort_order: banner.sort_order || 0,
            is_active: banner.is_active
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditBanner(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editBanner) {
            put(route('admin.banners.update', editBanner.id), {
                onSuccess: () => closeModal()
            });
        } else {
            post(route('admin.banners.store'), {
                onSuccess: () => closeModal()
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            destroy(route('admin.banners.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Homepage CMS Banners" />

            <div className="space-y-6 font-sans">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">CMS Banners</h1>
                        <p className="text-xs text-gray-400 mt-1">Configure carousels and promotional content grids on the live homepage.</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center space-x-1.5 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Banner</span>
                    </button>
                </div>

                {/* Banners Table */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-855 bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-6 font-semibold">Preview</th>
                                    <th className="py-3 px-6 font-semibold">Title & Context</th>
                                    <th className="py-3 px-6 font-semibold">Position</th>
                                    <th className="py-3 px-6 font-semibold text-center">Sort Order</th>
                                    <th className="py-3 px-6 font-semibold text-center">Status</th>
                                    <th className="py-3 px-6 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                                {banners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                                        <td className="py-4 px-6">
                                            <div className="w-24 h-12 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1.5">
                                                <img src={banner.image_path} alt={banner.title} className="max-h-full max-w-full object-cover rounded-sm" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900 dark:text-white">{banner.title || 'Untitled Banner'}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{banner.subtitle || 'No subtitle'}</p>
                                            <p className="text-[9px] text-[#0066CC] font-mono mt-1 select-all">{banner.link_url || 'No redirect link'}</p>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-[10px] tracking-wider text-gray-700 dark:text-gray-300">
                                            {positionLabel(banner.position)}
                                        </td>
                                        <td className="py-4 px-6 text-center font-bold text-gray-800 dark:text-gray-200">
                                            {banner.sort_order}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {banner.is_active ? (
                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-semibold">
                                                    <Eye className="w-3 h-3" />
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-850 text-gray-400 font-semibold">
                                                    <EyeOff className="w-3 h-3" />
                                                    <span>Inactive</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-2.5">
                                                <button 
                                                    onClick={() => openEditModal(banner)}
                                                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                                    title="Edit Banner"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(banner.id)}
                                                    className="p-1 rounded-full text-gray-400 hover:text-[#E30000]"
                                                    title="Delete Banner"
                                                >
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

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={closeModal} />
                    
                    <div className="w-full max-w-md bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden font-sans">
                        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {editBanner ? 'Edit Banner' : 'Create Banner'}
                            </h3>
                            <button onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Banner Title</label>
                                <input 
                                    type="text" 
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                    placeholder="e.g. iPhone 15 Pro"
                                />
                                <InputError message={errors.title} className="mt-1" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Subtitle / Description</label>
                                <textarea 
                                    value={data.subtitle}
                                    onChange={(e) => setData('subtitle', e.target.value)}
                                    rows="2"
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                    placeholder="e.g. Forged in titanium. Now in stock."
                                ></textarea>
                                <InputError message={errors.subtitle} className="mt-1" />
                            </div>

                             <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Image Path URL (Upload file or paste URL)</label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="text" 
                                        value={data.image_path}
                                        onChange={(e) => setData('image_path', e.target.value)}
                                        className="flex-1 text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        placeholder="Paste image URL here..."
                                        required
                                    />
                                    <label className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-4 rounded-xl flex items-center justify-center cursor-pointer border border-gray-300 dark:border-gray-700 transition-colors">
                                        <span>Choose File</span>
                                        <input 
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                // File banner art under banners/, not the products folder.
                                                formData.append('folder', 'banners');
                                                try {
                                                    const res = await fetch(route('admin.products.upload'), {
                                                        method: 'POST',
                                                        headers: {
                                                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                                                        },
                                                        body: formData
                                                    });
                                                    const resData = await res.json();
                                                    if (resData.url) {
                                                        setData('image_path', resData.url);
                                                    } else {
                                                        alert(resData.error || 'Upload failed');
                                                    }
                                                } catch (err) {
                                                    alert('Image upload failed');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <InputError message={errors.image_path} className="mt-1" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Target Redirect Link</label>
                                <input 
                                    type="text" 
                                    value={data.link_url}
                                    onChange={(e) => setData('link_url', e.target.value)}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                    placeholder="e.g. /category/iphone or /products/iphone-15-pro"
                                />
                                <InputError message={errors.link_url} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Placement Position</label>
                                    <select 
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        required
                                    >
                                        {BANNER_POSITIONS.map((pos) => (
                                            <option key={pos.value} value={pos.value}>
                                                {pos.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.position} className="mt-1" />
                                    {positionHint(data.position) && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                            {positionHint(data.position)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Sort order</label>
                                    <input 
                                        type="number" 
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        min="0"
                                        required
                                    />
                                    <InputError message={errors.sort_order} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="is_active" 
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 dark:border-gray-800 text-[#0066CC] focus:ring-[#0066CC]"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Set as Active (Visible immediately)</label>
                                <InputError message={errors.is_active} className="mt-1" />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-full"
                                >
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
