import React, { useRef, useState } from 'react';
import { UploadCloud, Link2, X, Loader2, ImageOff } from 'lucide-react';

/**
 * Drag-and-drop / file-picker / paste-a-URL image field for the admin CMS.
 *
 * Posts to the shared admin upload endpoint, which files the image under a
 * persistent folder above the web root and returns the public URL to store.
 *
 * @param {string}   value     Current image path/URL
 * @param {Function} onChange  Called with the new path
 * @param {string}   folder    Upload sub-folder — must be on the server allowlist
 * @param {string}   aspect    Tailwind aspect class for the preview box
 * @param {string}   hint      Helper line under the field
 */
export default function ImageUploader({
    value,
    onChange,
    folder = 'products',
    aspect = 'aspect-[16/9]',
    hint = 'PNG, JPG, WEBP or AVIF · up to 10 MB',
    error,
}) {
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [failed, setFailed] = useState(null);
    const inputRef = useRef(null);

    const upload = async (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setFailed('That file is not an image.');
            return;
        }

        setFailed(null);
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const res = await fetch(route('admin.products.upload'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: formData,
            });

            const data = await res.json();

            if (data.url) {
                onChange(data.url);
            } else {
                setFailed(data.error || 'Upload failed.');
            }
        } catch (e) {
            setFailed('Upload failed. Check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files?.[0]);
    };

    return (
        <div className="space-y-2">
            {/* Drop zone / preview */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                className={`relative ${aspect} w-full rounded-2xl overflow-hidden border-2 border-dashed transition-colors cursor-pointer ${
                    dragging
                        ? 'border-[#0066CC] bg-[#0066CC]/5'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
                {value ? (
                    <>
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden absolute inset-0 flex-col items-center justify-center text-gray-400 gap-1.5">
                            <ImageOff className="w-6 h-6" />
                            <span className="text-[10px] font-semibold">Image could not be loaded</span>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                                setFailed(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/55 hover:bg-black/75 text-white transition-colors"
                            title="Remove image"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/55 text-white text-[9px] font-semibold">
                            Click or drop to replace
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 px-4 text-center">
                        {uploading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin text-[#0066CC]" />
                                <span className="text-[11px] font-semibold">Uploading…</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-7 h-7" />
                                <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    Drag an image here, or click to choose
                                </span>
                                <span className="text-[10px]">{hint}</span>
                            </>
                        )}
                    </div>
                )}

                {uploading && value && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        upload(e.target.files?.[0]);
                        e.target.value = ''; // let the same file be picked again
                    }}
                />
            </div>

            {/* URL escape hatch — for artwork already hosted elsewhere */}
            <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 text-[11px] border border-gray-200 dark:border-gray-800 rounded-lg px-2.5 py-1.5 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white"
                    placeholder="…or paste an image URL"
                />
            </div>

            {(failed || error) && <p className="text-[11px] text-[#E30000] font-medium">{failed || error}</p>}
        </div>
    );
}
