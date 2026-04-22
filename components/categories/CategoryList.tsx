'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/config';

interface Category {
    id?: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    featured: boolean;
}

export default function CategoryList({ onEdit }: { onEdit?: (category: Category) => void }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const PAGE_SIZE = 50;
    const [sortOption, setSortOption] = useState<'name_asc' | 'name_desc'>('name_asc');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [confirmName, setConfirmName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/categories`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(Array.isArray(data.categories) ? data.categories : []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openConfirm = (id?: string, name?: string) => {
        if (!id) return alert('Cannot delete: missing id');
        setConfirmId(id);
        setConfirmName(name || null);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        setDeletingId(id);
        try {
            const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'accept': 'application/json' },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to delete category');
            }
            await fetchCategories();
            const totalPages = Math.max(1, Math.ceil((categories.length - 1) / PAGE_SIZE));
            if (currentPage > totalPages) setCurrentPage(totalPages);
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

    if (loading) return <div className="text-center py-10">Loading categories...</div>;
    if (error) return <div className="text-red-500 text-center py-10">Error: {error}</div>;

    return (
        <>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between gap-4 p-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Total:</span> {categories.length} categories
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">Showing {(categories.length === 0) ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, categories.length)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600">Sort:</label>
                        <select
                            value={sortOption}
                            onChange={(e) => { setSortOption(e.target.value as any); setCurrentPage(1); }}
                            className="px-3 py-1 text-sm border rounded-md bg-white"
                        >
                            <option value="name_asc">Category (A → Z)</option>
                            <option value="name_desc">Category (Z → A)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">Category</th>
                                <th className="px-6 py-4 font-bold">Slug</th>
                                <th className="px-6 py-4 font-bold">Description</th>
                                <th className="px-6 py-4 font-bold">Featured</th>
                                <th className="px-6 py-4 font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/** compute sorted + paginated categories */}
                            {(() => {
                                const sorted = [...categories].sort((a, b) => {
                                    if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
                                    if (sortOption === 'name_desc') return b.name.localeCompare(a.name);
                                    return 0;
                                });

                                const start = (currentPage - 1) * PAGE_SIZE;
                                const paged = sorted.slice(start, start + PAGE_SIZE);

                                return paged.map((category, index) => (
                                <tr key={category.id || index} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(category); }}
                                            className="font-bold text-blue-600 hover:text-blue-700 underline text-left cursor-pointer"
                                        >
                                            {category.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-400 font-mono">{category.slug}</td>
                                    <td className="px-6 py-4 truncate max-w-xs text-gray-500 font-medium">{category.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${category.featured
                                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                            : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                            {category.featured ? 'Featured' : 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit && onEdit(category); }}
                                                className="px-3 py-1 bg-gray-900 text-white font-bold rounded hover:bg-gray-800 shadow-sm active:scale-95 transition-all"
                                            >Update</button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openConfirm(category.id, category.name); }}
                                                disabled={!category.id || deletingId === category.id}
                                                className="px-3 py-1 text-sm text-red-600 border border-red-100 rounded disabled:opacity-50"
                                            >{deletingId === category.id ? 'Deleting...' : 'Delete'}</button>
                                        </div>
                                    </td>
                                </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
                {categories.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30">
                        <p className="text-gray-400 font-medium">No categories found yet.</p>
                    </div>
                )}

                {/* Confirmation Modal */}
                {confirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={() => { if (!deletingId) { setConfirmId(null); setConfirmName(null); } }} />
                        <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Confirm deletion</h3>
                            <p className="mt-3 text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold">{confirmName || confirmId}</span>? This action cannot be undone.</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => { if (!deletingId) { setConfirmId(null); setConfirmName(null); } }}
                                    className="px-4 py-2 bg-white border rounded text-gray-700"
                                    disabled={!!deletingId}
                                >Cancel</button>
                                <button
                                    onClick={() => confirmDelete()}
                                    className="px-4 py-2 bg-red-600 text-white rounded"
                                    disabled={!!deletingId}
                                >{deletingId === confirmId ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {categories.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between gap-4 p-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">Page {currentPage} of {Math.max(1, Math.ceil(categories.length / PAGE_SIZE))}</div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50"
                            >First</button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50"
                            >Prev</button>

                            {/* page numbers - show a small window */}
                            {(() => {
                                const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
                                const pages: number[] = [];
                                const start = Math.max(1, currentPage - 2);
                                const end = Math.min(totalPages, currentPage + 2);
                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`px-3 py-1 text-sm border rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-white'}`}
                                    >{p}</button>
                                ));
                            })()}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(categories.length / PAGE_SIZE), p + 1))}
                                disabled={currentPage >= Math.ceil(categories.length / PAGE_SIZE)}
                                className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50"
                            >Next</button>

                            <button
                                onClick={() => setCurrentPage(Math.ceil(categories.length / PAGE_SIZE))}
                                disabled={currentPage >= Math.ceil(categories.length / PAGE_SIZE)}
                                className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50"
                            >Last</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
