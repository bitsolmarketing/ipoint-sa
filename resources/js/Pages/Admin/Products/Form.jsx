import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Plus, Trash2, HelpCircle, Layers } from 'lucide-react';
import InputError from '@/Components/InputError';
import ImageUploader from '@/Components/Admin/ImageUploader';

export default function Form({ categories, colors, sizes, product, isEdit, attributeGroups = [], selectedAttributeValues = [] }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: product?.name || '',
        category_id: product?.category_id || '',
        listing_type: product?.listing_type || 'box_pack',
        condition_grade: product?.condition_grade || '',
        cosmetic_notes: product?.cosmetic_notes || '',
        battery_health: product?.battery_health || '',
        description: product?.description || '',
        base_price: product?.base_price || '',
        original_price: product?.original_price || '',
        image_path: product?.image_path || '',
        is_featured: product ? !!product.is_featured : false,
        is_new: product ? !!product.is_new : false,
        is_on_promo: product ? !!product.is_on_promo : false,
        gallery_images: product?.gallery_images || [],
        summary_specs: product?.summary_specs || [
            { label: 'Screen Size', value: '', icon: 'smartphone' },
            { label: 'Network', value: '', icon: 'wifi' },
            { label: 'Main Camera', value: '', icon: 'camera' },
            { label: 'Battery', value: '', icon: 'battery' },
            { label: 'Chipset', value: '', icon: 'cpu' }
        ],
        technical_specs: product?.technical_specs || [
            { spec_key: 'Build', spec_val: '' },
            { spec_key: 'Display Type', spec_val: '' },
            { spec_key: 'OS', spec_val: '' },
            { spec_key: 'CPU', spec_val: '' },
            { spec_key: 'GPU', spec_val: '' },
            { spec_key: 'Weight', spec_val: '' }
        ],
        variants: product?.variants || [
            { color_id: '', size_id: '', image_path: '', sku: '', price_modifier: 0, stock: 10 }
        ],
        attribute_value_ids: selectedAttributeValues || []
    });

    const [newGalleryUrl, setNewGalleryUrl] = useState('');

    const handleAddGalleryUrl = () => {
        if (!newGalleryUrl.trim()) return;
        setData('gallery_images', [...data.gallery_images, newGalleryUrl.trim()]);
        setNewGalleryUrl('');
    };

    const handleRemoveGalleryUrl = (index) => {
        setData('gallery_images', data.gallery_images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Ensure price modifier is numerical
        const formattedVariants = data.variants.map(v => ({
            ...v,
            price_modifier: parseFloat(v.price_modifier || 0),
            stock: parseInt(v.stock || 0)
        }));

        setData('variants', formattedVariants);

        if (isEdit) {
            put(route('admin.products.update', product.id));
        } else {
            post(route('admin.products.store'));
        }
    };

    const addVariantRow = () => {
        setData('variants', [
            ...data.variants,
            { color_id: '', size_id: '', image_path: '', sku: '', price_modifier: 0, stock: 10 }
        ]);
    };

    const removeVariantRow = (index) => {
        if (data.variants.length === 1) {
            alert('A product must contain at least one variant configuration.');
            return;
        }
        setData('variants', data.variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        const updated = data.variants.map((v, i) => {
            if (i === index) {
                return { ...v, [field]: value };
            }
            return v;
        });
        setData('variants', updated);
    };

    const handleAttributeToggle = (valueId) => {
        const current = data.attribute_value_ids;
        if (current.includes(valueId)) {
            setData('attribute_value_ids', current.filter(id => id !== valueId));
        } else {
            setData('attribute_value_ids', [...current, valueId]);
        }
    };

    const autoGenerateSKUs = () => {
        if (!data.name) {
            alert('Please enter a product name first before generating SKUs.');
            return;
        }

        const nameSlug = data.name.replace(/\s+/g, '').substring(0, 5).toUpperCase();
        
        const updated = data.variants.map((v, i) => {
            const selectedColor = colors.find(c => c.id == v.color_id);
            const selectedSize = sizes.find(s => s.id == v.size_id);
            
            const colorCode = selectedColor ? selectedColor.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() : 'GEN';
            const sizeCode = selectedSize ? selectedSize.name.replace(/\s+/g, '').toUpperCase() : 'FS';
            
            // Generate a code: PRD-NAME-COLOR-SIZE-RAND
            const suffix = Math.floor(10 + Math.random() * 90); // 2 digit random
            const sku = `IPT-${nameSlug}-${colorCode}-${sizeCode}-${suffix}`;
            
            return { ...v, sku: sku };
        });

        setData('variants', updated);
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit Product — ${product.name}` : 'Create Product'} />

            <div className="space-y-6 font-sans">
                {/* Back Link */}
                <Link 
                    href="/admin/products"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Products</span>
                </Link>

                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {isEdit ? `Modify ${product.name}` : 'Create Product'}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Configure catalogs details, tags, and product variants prices.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Product Information Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Parent Information Card */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
                                Product Specifications
                            </h3>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Product Title</label>
                                <input 
                                    type="text" 
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                    placeholder="e.g. iPhone 15 Pro Max"
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Category</label>
                                    <select 
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                    >
                                        <option value="">Uncategorized</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category_id} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Base Price (ZAR)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={data.base_price}
                                        onChange={(e) => setData('base_price', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        placeholder="e.g. 19999.00"
                                        required
                                    />
                                    <InputError message={errors.base_price} className="mt-1" />
                                </div>
                            </div>

                            {/* Listing type — Box Pack / Gold Desire (§6) */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Listing Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'box_pack', label: 'Box Pack', hint: 'New, sealed-box unit' },
                                        { key: 'gold_desire', label: 'Gold Desire', hint: 'Used / refurbished unit' },
                                    ].map((opt) => (
                                        <button
                                            type="button"
                                            key={opt.key}
                                            onClick={() => setData('listing_type', opt.key)}
                                            className={`p-3 rounded-2xl border text-left transition-all ${
                                                data.listing_type === opt.key
                                                    ? 'border-[#0066CC] bg-[#F0F7FF]/50 dark:bg-blue-950/20'
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
                                            }`}
                                        >
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{opt.label}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{opt.hint}</p>
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.listing_type} className="mt-1" />
                            </div>

                            {/* Gold Desire grading fields */}
                            {data.listing_type === 'gold_desire' && (
                                <div className="border border-[#E7D9AE] dark:border-[#B8860B]/30 bg-[#FCF7EA]/60 dark:bg-[#B8860B]/10 rounded-2xl p-4 space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B]">Gold Desire — grading details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Condition Grade</label>
                                            <select
                                                value={data.condition_grade}
                                                onChange={(e) => setData('condition_grade', e.target.value)}
                                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                            >
                                                <option value="">Not set</option>
                                                <option value="A">Grade A</option>
                                                <option value="B">Grade B</option>
                                                <option value="C">Grade C</option>
                                            </select>
                                            <InputError message={errors.condition_grade} className="mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Battery Health (%)</label>
                                            <input
                                                type="number" min="0" max="100"
                                                value={data.battery_health}
                                                onChange={(e) => setData('battery_health', e.target.value)}
                                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                                placeholder="e.g. 92"
                                            />
                                            <InputError message={errors.battery_health} className="mt-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Cosmetic Condition Notes</label>
                                        <textarea
                                            value={data.cosmetic_notes}
                                            onChange={(e) => setData('cosmetic_notes', e.target.value)}
                                            rows="2"
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                            placeholder="e.g. Grade A — minimal signs of use, no visible scratches on the display."
                                        ></textarea>
                                        <InputError message={errors.cosmetic_notes} className="mt-1" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                    placeholder="Write a detailed marketing description."
                                ></textarea>
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Cover Image (Upload file or paste URL)</label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="text" 
                                        value={data.image_path}
                                        onChange={(e) => setData('image_path', e.target.value)}
                                        className="flex-1 text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        placeholder="Paste image URL here..."
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

                            {/* Multiple Gallery Images Configurer */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-850 space-y-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase">Product Gallery Images</label>
                                
                                {/* URL Input Row */}
                                <div className="flex space-x-2">
                                    <input 
                                        type="text" 
                                        value={newGalleryUrl}
                                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                                        className="flex-1 text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        placeholder="Paste image URL here..."
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
                                                        setData('gallery_images', [...data.gallery_images, resData.url]);
                                                    } else {
                                                        alert(resData.error || 'Upload failed');
                                                    }
                                                } catch (err) {
                                                    alert('Image upload failed');
                                                }
                                            }}
                                        />
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={handleAddGalleryUrl}
                                        className="bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold px-5 rounded-xl transition-all"
                                    >
                                        Add URL
                                    </button>
                                </div>
                                <InputError message={errors.gallery_images} className="mt-1" />

                                {/* Gallery Items Lists with delete button */}
                                {data.gallery_images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                        {data.gallery_images.map((url, index) => (
                                            <div key={index} className="relative group border border-gray-150 dark:border-gray-805 rounded-xl overflow-hidden bg-white p-1">
                                                <img src={url} className="w-full h-20 object-contain" alt="gallery item" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGalleryUrl(index)}
                                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-colors"
                                                    title="Delete Image"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                <p className="text-[8px] text-gray-400 truncate mt-1 px-1 font-mono">{url}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variants Section */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-850">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                                    <Layers className="w-4 h-4 text-[#0066CC]" />
                                    <span>Product Variants / SKUs</span>
                                </h3>
                                <div className="flex space-x-2">
                                    <button 
                                        type="button"
                                        onClick={autoGenerateSKUs}
                                        className="border border-[#0066CC] hover:bg-[#F0F7FF] dark:hover:bg-blue-950/20 text-[#0066CC] text-[10px] font-bold uppercase px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        Auto-Gen SKUs
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={addVariantRow}
                                        className="bg-[#0066CC] hover:bg-[#0077ED] text-white text-[10px] font-bold uppercase px-3.5 py-1.5 rounded-full flex items-center space-x-1 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add variant</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic variants listing */}
                            <div className="space-y-4">
                                {data.variants.map((v, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl relative">
                                        <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                                            {/* Color select */}
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Color</label>
                                                <select 
                                                    value={v.color_id || ''}
                                                    onChange={(e) => handleVariantChange(index, 'color_id', e.target.value || null)}
                                                    className="w-full text-[11px] border border-gray-200 dark:border-gray-750 rounded-lg p-1.5 bg-white dark:bg-gray-800 text-[#1d1d1f] dark:text-white focus:ring-0"
                                                >
                                                    <option value="">None</option>
                                                    {colors.map(col => (
                                                        <option key={col.id} value={col.id}>{col.name}</option>
                                                    ))}
                                                </select>
                                                <InputError message={errors[`variants.${index}.color_id`]} className="mt-0.5" />
                                            </div>

                                            {/* Size select */}
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Size/Cap</label>
                                                <select 
                                                    value={v.size_id || ''}
                                                    onChange={(e) => handleVariantChange(index, 'size_id', e.target.value || null)}
                                                    className="w-full text-[11px] border border-gray-200 dark:border-gray-750 rounded-lg p-1.5 bg-white dark:bg-gray-800 text-[#1d1d1f] dark:text-white focus:ring-0"
                                                >
                                                    <option value="">None</option>
                                                    {sizes.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <InputError message={errors[`variants.${index}.size_id`]} className="mt-0.5" />
                                            </div>
                                        </div>

                                        {/* SKU code input */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">SKU Code</label>
                                            <input 
                                                type="text" 
                                                value={v.sku}
                                                onChange={(e) => handleVariantChange(index, 'sku', e.target.value.toUpperCase())}
                                                placeholder="SKU-CODE"
                                                className="w-full text-[11px] border border-gray-200 dark:border-gray-750 rounded-lg p-1.5 bg-white dark:bg-gray-800 text-[#1d1d1f] dark:text-white focus:ring-0 font-mono"
                                                required
                                            />
                                            <InputError message={errors[`variants.${index}.sku`]} className="mt-0.5" />
                                        </div>

                                        {/* Price modifier input */}
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Price Mod (+)</label>
                                            <input 
                                                type="number" 
                                                value={v.price_modifier}
                                                onChange={(e) => handleVariantChange(index, 'price_modifier', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-[11px] border border-gray-200 dark:border-gray-750 rounded-lg p-1.5 bg-white dark:bg-gray-800 text-[#1d1d1f] dark:text-white focus:ring-0"
                                                required
                                            />
                                            <InputError message={errors[`variants.${index}.price_modifier`]} className="mt-0.5" />
                                        </div>

                                        {/* Stock input & Remove button */}
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Stock</label>
                                                <input 
                                                    type="number" 
                                                    value={v.stock}
                                                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                    placeholder="10"
                                                    className="w-full text-[11px] border border-gray-200 dark:border-gray-750 rounded-lg p-1.5 bg-white dark:bg-gray-800 text-[#1d1d1f] dark:text-white focus:ring-0"
                                                    required
                                                />
                                                <InputError message={errors[`variants.${index}.stock`]} className="mt-0.5" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeVariantRow(index)}
                                                className="p-1 rounded-full text-gray-400 hover:text-[#E30000] mt-4"
                                                title="Remove variant"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Per-variant image — shown on the storefront when a shopper picks this color */}
                                        <div className="sm:col-span-6 pt-3 mt-1 border-t border-gray-200 dark:border-gray-750 flex items-start gap-3">
                                            <div className="w-28 flex-shrink-0">
                                                <ImageUploader
                                                    value={v.image_path}
                                                    onChange={(url) => handleVariantChange(index, 'image_path', url)}
                                                    folder="products"
                                                    aspect="aspect-square"
                                                    hint=""
                                                    error={errors[`variants.${index}.image_path`]}
                                                />
                                            </div>
                                            <p className="flex-1 pt-1 text-[10px] text-gray-400 leading-relaxed">
                                                <span className="font-bold text-gray-500 dark:text-gray-300 uppercase text-[9px] block mb-1">Image for this color</span>
                                                Shown on the product page when a shopper selects this color/size combination.
                                                Leave empty to keep showing the main product image.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Attributes Section */}
                        {attributeGroups.length > 0 && (
                            <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850 flex items-center space-x-2">
                                    <Layers className="w-4 h-4 text-[#0066CC]" />
                                    <span>Product Attributes</span>
                                </h3>

                                <div className="space-y-5">
                                    {attributeGroups.map((group) => (
                                        <div key={group.id}>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{group.name}</label>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                {group.values.map((val) => (
                                                    <div key={val.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`attr_val_${val.id}`}
                                                            checked={data.attribute_value_ids.includes(val.id)}
                                                            onChange={() => handleAttributeToggle(val.id)}
                                                            className="rounded border-gray-300 dark:border-gray-800 text-[#0066CC] focus:ring-[#0066CC]"
                                                        />
                                                        <label htmlFor={`attr_val_${val.id}`} className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            {val.value}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Promotional details and Submission */}
                    <div className="space-y-6">
                        {/* Tags Card */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
                                Promotional Flags
                            </h3>

                            <div className="space-y-3.5 text-xs font-semibold">
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_featured" 
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="rounded border-gray-300 dark:border-gray-800 text-[#0066CC] focus:ring-[#0066CC]"
                                    />
                                    <label htmlFor="is_featured" className="text-gray-700 dark:text-gray-300">Set as Featured product</label>
                                    <InputError message={errors.is_featured} className="mt-1" />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_new" 
                                        checked={data.is_new}
                                        onChange={(e) => setData('is_new', e.target.checked)}
                                        className="rounded border-gray-300 dark:border-gray-800 text-[#0066CC] focus:ring-[#0066CC]"
                                    />
                                    <label htmlFor="is_new" className="text-gray-700 dark:text-gray-300">Set as New Arrival</label>
                                    <InputError message={errors.is_new} className="mt-1" />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_on_promo" 
                                        checked={data.is_on_promo}
                                        onChange={(e) => setData('is_on_promo', e.target.checked)}
                                        className="rounded border-gray-300 dark:border-gray-800 text-[#0066CC] focus:ring-[#0066CC]"
                                    />
                                    <label htmlFor="is_on_promo" className="text-gray-700 dark:text-gray-300">Set on Discount Promotion</label>
                                    <InputError message={errors.is_on_promo} className="mt-1" />
                                </div>
                            </div>

                            {data.is_on_promo && (
                                <div className="pt-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Original price (Cross-through ZAR)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={data.original_price}
                                        onChange={(e) => setData('original_price', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-850 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                        placeholder="Original price"
                                        required={data.is_on_promo}
                                    />
                                    <InputError message={errors.original_price} className="mt-1" />
                                </div>
                            )}
                        </div>

                        {/* Product Summary Specs & Technical Details */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-805 rounded-3xl p-6 md:p-8 space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3">
                                Product Specifications Settings
                            </h3>

                            {/* Summary Specs Highlights (Cards Grid) */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-450 uppercase">Summary Specs (Highlights Tab)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.summary_specs.map((item, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">{item.label}</label>
                                            <input 
                                                type="text"
                                                value={item.value}
                                                onChange={(e) => {
                                                    const updated = [...data.summary_specs];
                                                    updated[idx].value = e.target.value;
                                                    setData('summary_specs', updated);
                                                }}
                                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                                placeholder={`e.g. ${item.label === 'Battery' ? '11-low 3500 mAh' : 'Detail info'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Specifications Tab values list */}
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-gray-450 uppercase">Technical Specifications (Details Tab)</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('technical_specs', [...data.technical_specs, { spec_key: '', spec_val: '' }]);
                                        }}
                                        className="text-xs font-bold text-[#0066CC] hover:underline flex items-center"
                                    >
                                        + Add Spec Row
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {data.technical_specs.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-2xl border sm:border-0 border-gray-150 dark:border-gray-800">
                                            <div className="col-span-12 sm:col-span-4">
                                                <input 
                                                    type="text"
                                                    value={item.spec_key}
                                                    onChange={(e) => {
                                                        const updated = [...data.technical_specs];
                                                        updated[idx].spec_key = e.target.value;
                                                        setData('technical_specs', updated);
                                                    }}
                                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-white dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                                    placeholder="Spec Key (e.g. Bluetooth)"
                                                />
                                            </div>
                                            <div className="col-span-10 sm:col-span-7">
                                                <input 
                                                    type="text"
                                                    value={item.spec_val}
                                                    onChange={(e) => {
                                                        const updated = [...data.technical_specs];
                                                        updated[idx].spec_val = e.target.value;
                                                        setData('technical_specs', updated);
                                                    }}
                                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-white dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                                                    placeholder="Spec Value (e.g. 5.3, A2DP, LE)"
                                                />
                                            </div>
                                            <div className="col-span-2 sm:col-span-1 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = data.technical_specs.filter((_, i) => i !== idx);
                                                        setData('technical_specs', updated);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-full flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] shadow-md"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
