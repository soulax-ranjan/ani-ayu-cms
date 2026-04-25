"use client";

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/config';

interface Banner {
    id?: string;
    _id?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    active?: boolean;
    featured?: boolean;
}

interface Props {
    onDeleted?: () => void;
    onEdit?: (b: any) => void;
}

export default function BannerList({ onDeleted, onEdit }: Props) {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const PAGE_SIZE = 50;
    const [sortOption, setSortOption] = useState<'order_asc' | 'order_desc' | 'title_asc' | 'title_desc'>('order_asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [confirmName, setConfirmName] = useState<string | null>(null);

    const fetchBanners = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/banners`);
            if (!res.ok) throw new Error('Failed to fetch banners');
            const data = await res.json();
            const list = Array.isArray(data) ? data : (Array.isArray(data.banners) ? data.banners : []);
            setBanners(list);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const openConfirm = (id?: string, name?: string) => {
        if (!id) return alert('Cannot delete: missing id');
        setConfirmId(id);
        setConfirmName(name || null);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        setDeletingId(id);
        try {
            const res = await fetch(`${API_BASE_URL}/banners/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { accept: 'application/json' } });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to delete banner');
            }
            await fetchBanners();
            const totalPages = Math.max(1, Math.ceil((banners.length - 1) / PAGE_SIZE));
            if (currentPage > totalPages) setCurrentPage(totalPages);
            onDeleted?.();
        } catch (err: any) {
            alert(err.message || 'Delete failed');
        } finally {
            setDeletingId(null);
            setConfirmId(null);
            setConfirmName(null);
        }
    };

    const confirmDelete = async () => {
        if (!confirmId) return;
        await handleDelete(confirmId);
    };

    const handleEditClick = (b: Banner) => {
        onEdit?.(b);
    };

    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    if (loading) return <div className="text-center py-10 text-gray-400 font-medium">Fetching banners...</div>;
    if (error) return <div className="text-red-500 text-center py-10 font-medium">Error: {error}</div>;

    return (
        <>
            <div className="md-card overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Total:</span> {banners.length} banners
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span className="text-gray-500 block sm:inline">Showing {(banners.length === 0) ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, banners.length)}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm text-gray-600 whitespace-nowrap font-medium">Sort:</label>
                        <select value={sortOption} onChange={(e) => { setSortOption(e.target.value as any); setCurrentPage(1); }} className="md-input w-full sm:w-auto py-1.5">
                            <option value="order_asc">Order (Low → High)</option>
                            <option value="order_desc">Order (High → Low)</option>
                            <option value="title_asc">Title (A → Z)</option>
                            <option value="title_desc">Title (Z → A)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-500 uppercase bg-surface-variant/30 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Banner</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Subtitle</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Order</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Featured</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Active</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(() => {
                                const sorted = [...banners].sort((a: any, b: any) => {
                                    switch (sortOption) {
                                        case 'order_asc': return (a.order || 0) - (b.order || 0);
                                        case 'order_desc': return (b.order || 0) - (a.order || 0);
                                        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
                                        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
                                        default: return 0;
                                    }
                                });

                                const start = (currentPage - 1) * PAGE_SIZE;
                                const paged = sorted.slice(start, start + PAGE_SIZE);

                                return paged.map((b: any, idx) => (
                                    <tr key={b.id || b._id || idx} className="hover:bg-primary-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-20 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    <img
                                                        src={b.image || `https://placehold.co/120x80?text=No+Image`}
                                                        alt={b.title}
                                                        className="h-full w-full object-cover object-center cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); setLightboxImage(b.image || `https://placehold.co/600x400?text=Banner`); }}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x80?text=Banner'; }}
                                                    />
                                                </div>
                                                <div>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(b); }} className="font-bold text-primary-600 hover:text-primary-700 hover:underline text-left">{b.title}</button>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">{b._id || b.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-500">{b.subtitle}</td>
                                        <td className="px-6 py-4">{b.order ?? 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${b.featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>{b.featured ? 'Featured' : 'Standard'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${b.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{b.active ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(b); }} className="md-btn-primary px-4 py-1.5 text-sm whitespace-nowrap">Update</button>
                                                <button onClick={(e) => { e.stopPropagation(); openConfirm(b.id || b._id, b.title); }} disabled={!(b.id || b._id) || deletingId === (b.id || b._id)} className="md-btn-outlined px-4 py-1.5 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 whitespace-nowrap">{deletingId === (b.id || b._id) ? 'Deleting...' : 'Delete'}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>

                {banners.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30">
                        <p className="text-gray-400 font-medium">No banners found yet.</p>
                    </div>
                )}

                {confirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={() => { if (!deletingId) { setConfirmId(null); setConfirmName(null); } }} />
                        <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Confirm deletion</h3>
                            <p className="mt-3 text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold">{confirmName || confirmId}</span>? This action cannot be undone.</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => { if (!deletingId) { setConfirmId(null); setConfirmName(null); } }} className="px-4 py-2 bg-white border rounded text-gray-700" disabled={!!deletingId}>Cancel</button>
                                <button onClick={() => confirmDelete()} className="px-4 py-2 bg-red-600 text-white rounded" disabled={!!deletingId}>{deletingId === confirmId ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {banners.length > PAGE_SIZE && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600 text-center sm:text-left">Page {currentPage} of {Math.max(1, Math.ceil(banners.length / PAGE_SIZE))}</div>

                        <div className="flex items-center justify-center flex-wrap gap-2">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50">First</button>
                            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50">Prev</button>
                            {(() => {
                                const totalPages = Math.max(1, Math.ceil(banners.length / PAGE_SIZE));
                                const pages: number[] = [];
                                const start = Math.max(1, currentPage - 2);
                                const end = Math.min(totalPages, currentPage + 2);
                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages.map((p) => (
                                    <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 text-sm border rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-white'}`}>{p}</button>
                                ));
                            })()}
                            <button onClick={() => setCurrentPage((p) => Math.min(Math.ceil(banners.length / PAGE_SIZE), p + 1))} disabled={currentPage >= Math.ceil(banners.length / PAGE_SIZE)} className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50">Next</button>
                            <button onClick={() => setCurrentPage(Math.ceil(banners.length / PAGE_SIZE))} disabled={currentPage >= Math.ceil(banners.length / PAGE_SIZE)} className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50">Last</button>
                        </div>
                    </div>
                )}
            {lightboxImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setLightboxImage(null)} />
                    <div role="dialog" aria-modal="true" className="relative p-4 flex items-center justify-center bg-white rounded-lg" style={{ width: 'min(90vw, 800px)', height: 'min(90vh, 800px)' }}>
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-2 right-2 z-50 bg-white rounded-full p-2 shadow text-gray-700 cursor-pointer"
                            aria-label="Close image"
                        >
                            ✕
                        </button>
                        <img src={lightboxImage} alt="Preview" className="max-w-full max-h-full w-full h-full object-contain object-center rounded-lg" />
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
