"use client";

import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../lib/config';

interface Props {
    onSuccess: () => void;
    onCancel?: () => void;
    initialValues?: any;
}

export default function AddBannerForm({ onSuccess, onCancel, initialValues }: Props) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#000000');
    const [featured, setFeatured] = useState(false);
    const [active, setActive] = useState(true);
    const [order, setOrder] = useState(0);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [deletingImage, setDeletingImage] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const tryDeleteVariant = async (variant: string) => {
        return fetch(`${API_BASE_URL}/upload/${encodeURIComponent(variant)}`, {
            method: 'DELETE',
            headers: { accept: 'application/json' },
        });
    };

    const deleteUploadApi = async (filePath: string) => {
        if (!filePath) return;
        setDeletingImage(true);

        const variants: string[] = [];
        try {
            const parsed = new URL(filePath);
            const parts = parsed.pathname.split('/').filter(Boolean);
            const pubIdx = parts.indexOf('public');
            if (pubIdx >= 0) {
                variants.push(parts.slice(pubIdx + 1).join('/'));
                variants.push(parts[parts.length - 1]);
                variants.push(parsed.pathname.replace(/^\//, ''));
            } else {
                variants.push(parts[parts.length - 1] || filePath);
                variants.push(parsed.pathname.replace(/^\//, ''));
            }
        } catch (e) {
            // not a full URL
            variants.push(filePath);
            const parts = filePath.split('/').filter(Boolean);
            variants.push(parts[parts.length - 1] || filePath);
        }

        const uniqueVariants = Array.from(new Set(variants.filter(Boolean)));

        let success = false;
        let lastErr: any = null;
        for (const v of uniqueVariants) {
            try {
                const res = await tryDeleteVariant(v);
                if (res.ok) {
                    success = true;
                    break;
                } else {
                    lastErr = await res.json().catch(() => ({ message: `Delete failed for ${v}` }));
                }
            } catch (err) {
                lastErr = err;
            }
        }

        if (success) {
            setImage('');
        } else {
            setError((lastErr && (lastErr.message || JSON.stringify(lastErr))) || 'Failed to delete image');
        }

        setDeletingImage(false);
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`${API_BASE_URL}/upload/image?type=banner`, {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setImage(data.url || data.path || '');
        } catch (err: any) {
            setError(err?.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                title,
                subtitle,
                description,
                image,
                ctaText,
                ctaLink,
                backgroundColor,
                textColor,
                featured,
                active,
                order: Number(order) || 0,
            } as any;

            let res: Response;
            if (initialValues?.id || initialValues?._id) {
                const id = initialValues.id || initialValues._id;
                res = await fetch(`${API_BASE_URL}/banners/${encodeURIComponent(id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`${API_BASE_URL}/banners`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to save banner');
            }

            onSuccess();
        } catch (err: any) {
            setError(err?.message || 'Submit failed');
        } finally {
            setLoading(false);
        }
    };

    // populate fields when editing
    useEffect(() => {
        if (initialValues) {
            setTitle(initialValues.title || '');
            setSubtitle(initialValues.subtitle || '');
            setDescription(initialValues.description || '');
            setImage(initialValues.image || '');
            setCtaText(initialValues.ctaText || initialValues.cta_text || '');
            setCtaLink(initialValues.ctaLink || initialValues.cta_link || '');
            setBackgroundColor(initialValues.backgroundColor || initialValues.background_color || '#ffffff');
            setTextColor(initialValues.textColor || initialValues.text_color || '#000000');
            setFeatured(Boolean(initialValues.featured));
            setActive(initialValues.active ?? true);
            setOrder(initialValues.order ?? 0);
        }
    }, [initialValues]);

    return (
        <>
        <form onSubmit={handleSubmit} className="compact-form bg-white p-5 rounded-xl shadow-md border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div>
                    <h2 className="text-lg font-black text-gray-900">Add Banner</h2>
                    <p className="text-xs text-gray-500 mt-1">Create a banner for the storefront.</p>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none text-sm" />
                </div>

                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Subtitle</label>
                    <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none text-sm" />
                </div>

                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl resize-none focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none text-sm" />
                </div>

                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Image</label>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all">{uploading ? 'Uploading...' : 'Upload Image'}</button>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

                                {image ? (
                                    <div className="relative h-28 w-40 rounded-xl overflow-hidden border border-gray-100">
                                        <img
                                            src={image}
                                            className="h-full w-full object-cover object-center block cursor-pointer"
                                            onClick={() => setLightboxImage(image)}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x80?text=Banner'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={async (e) => { e.stopPropagation(); if (!image) return; await deleteUploadApi(image); }}
                                            disabled={deletingImage}
                                            title="Delete image"
                                            className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-sm text-red-600 shadow"
                                        >
                                            {deletingImage ? '...' : '✕'}
                                        </button>
                                    </div>
                                ) : (
                                    <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Or paste image URL" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white outline-none text-sm" />
                                )}
                            </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">CTA Text</label>
                        <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white outline-none text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">CTA Link</label>
                        <input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white outline-none text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Background</label>
                        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-9 p-0 border rounded" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Text Color</label>
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-9 p-0 border rounded" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Order</label>
                        <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white outline-none text-sm" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5" /> <span className="text-xs">Featured</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-5 h-5" /> <span className="text-xs">Active</span></label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-500 font-semibold uppercase tracking-widest hover:bg-gray-50 rounded-xl">Cancel</button>}
                <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-900 text-white font-semibold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">{loading ? 'Saving...' : 'Save Banner'}</button>
            </div>
        </form>
        {lightboxImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/60" onClick={() => setLightboxImage(null)} />
                <div role="dialog" aria-modal="true" className="relative p-4 flex items-center justify-center bg-white rounded-lg" style={{ width: 'min(90vw, 900px)', height: 'min(90vh, 900px)' }}>
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-2 right-2 z-50 bg-white rounded-full p-2 shadow text-gray-700 cursor-pointer"
                        aria-label="Close image"
                    >
                        
                    </button>
                    <img src={lightboxImage} alt="Preview" className="max-w-full max-h-full w-full h-full object-contain object-center rounded-lg" />
                </div>
            </div>
        )}
        </>
    );
}
