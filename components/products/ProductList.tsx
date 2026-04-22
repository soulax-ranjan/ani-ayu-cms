'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/config';
import ProductDetailsModal from './ProductDetailsModal';

interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    short_description: string;
    price: number;
    original_price: number;
    discount_percent: number;
    currency: string;
    image_url: string;
    images: string[];
    video_url: string | null;
    sizes: string[];
    colors: string[];
    category_id: string | null;
    material: string;
    occasion: string;
    age_range: string;
    features: string[];
    in_stock: boolean;
    featured: boolean;
    rating: number;
    review_count: number;
    brand: string;
    barcode: string | null;
    tags: string[];
    specifications: {
        closure_type: string;
        care_instructions: string;
        country_of_origin: string;
        fabric_composition: string;
    };
    stock_quantity: number;
    low_stock_threshold: number;
    status: string;
    customizable: boolean;
    shipping_weight: number;
    dimensions: {
        unit: string;
        width: number;
        height: number;
        length: number;
    };
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    return_policy: string;
    warranty: string;
    suggested?: boolean;
    allProduct?: boolean;
}

export default function ProductList({ onEdit }: { onEdit?: (p: Product) => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const PAGE_SIZE = 50;
    const [sortOption, setSortOption] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'featured_first' | 'featured_last'>('name_asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [confirmName, setConfirmName] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(Array.isArray(data.products) ? data.products : []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
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
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { accept: 'application/json' },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to delete product');
            }
            await fetchProducts();
            const totalPages = Math.max(1, Math.ceil((products.length - 1) / PAGE_SIZE));
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

    if (loading) return <div className="text-center py-10 text-gray-400 font-medium">Fetching the latest items...</div>;
    if (error) return <div className="text-red-500 text-center py-10 font-medium">Error: {error}</div>;

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
            <div className="md-card overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Total:</span> {products.length} products
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span className="text-gray-500 block sm:inline">Showing {(products.length === 0) ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, products.length)}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm text-gray-600 whitespace-nowrap font-medium">Sort:</label>
                        <select
                            value={sortOption}
                            onChange={(e) => { setSortOption(e.target.value as any); setCurrentPage(1); }}
                            className="md-input w-full sm:w-auto py-1.5"
                        >
                            <option value="name_asc">Product (A → Z)</option>
                            <option value="name_desc">Product (Z → A)</option>
                            <option value="price_asc">Price (Low → High)</option>
                            <option value="price_desc">Price (High → Low)</option>
                            <option value="stock_asc">Stock (Low → High)</option>
                            <option value="stock_desc">Stock (High → Low)</option>
                            <option value="featured_first">Featured (First)</option>
                            <option value="featured_last">Featured (Last)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-500 uppercase bg-surface-variant/30 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Price</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Stock</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(() => {
                                const sorted = [...products].sort((a, b) => {
                                    switch (sortOption) {
                                        case 'name_asc': return a.name.localeCompare(b.name);
                                        case 'name_desc': return b.name.localeCompare(a.name);
                                        case 'price_asc': return a.price - b.price;
                                        case 'price_desc': return b.price - a.price;
                                        case 'stock_asc': return a.stock_quantity - b.stock_quantity;
                                        case 'stock_desc': return b.stock_quantity - a.stock_quantity;
                                        case 'featured_first': return (b.featured === a.featured) ? a.name.localeCompare(b.name) : (b.featured ? 1 : -1) * -1;
                                        case 'featured_last': return (b.featured === a.featured) ? a.name.localeCompare(b.name) : (b.featured ? -1 : 1) * -1;
                                        default: return 0;
                                    }
                                });

                                const start = (currentPage - 1) * PAGE_SIZE;
                                const paged = sorted.slice(start, start + PAGE_SIZE);

                                return paged.map((product) => (
                                    <tr
                                        key={product.id}
                                        onClick={() => onEdit ? onEdit(product) : setSelectedProduct(product)}
                                        className="hover:bg-primary-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    <img
                                                        src={product.image_url && product.image_url.startsWith('http') ? product.image_url : `https://placehold.co/100x125?text=No+Image`}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover object-center cursor-pointer block"
                                                        onClick={(e) => { e.stopPropagation(); setLightboxImage(product.image_url && product.image_url.startsWith('http') ? product.image_url : `https://placehold.co/600x800?text=Product`); }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x125?text=Product';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onEdit) onEdit(product); else setSelectedProduct(product); }}
                                                        className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors block max-w-[200px] sm:max-w-xs truncate"
                                                    >
                                                        {product.name}
                                                    </a>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">{product.sku || product.id.split('-')[0]}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {product.suggested && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Suggested</span>
                                                        )}
                                                        {product.allProduct && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">All</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col whitespace-nowrap">
                                                <span className="font-bold text-gray-900">{product.currency} {product.price.toLocaleString()}</span>
                                                {product.original_price > product.price && (
                                                    <span className="text-xs text-gray-400 line-through">{product.currency} {product.original_price.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <div className={`h-2 w-2 rounded-full ${product.stock_quantity > 10 ? 'bg-green-500' : product.stock_quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                                                <span className="font-medium">{product.stock_quantity} in stock</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${product.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(product); else setSelectedProduct(product); }}
                                                    className="md-btn-primary px-4 py-1.5 text-sm whitespace-nowrap"
                                                >Update</button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openConfirm(product.id, product.name); }}
                                                    disabled={!product.id || deletingId === product.id}
                                                    className="md-btn-outlined px-4 py-1.5 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 whitespace-nowrap"
                                                >{deletingId === product.id ? 'Deleting...' : 'Delete'}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30">
                        <p className="text-gray-400">No products found</p>
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
                {products.length > PAGE_SIZE && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600 text-center sm:text-left">Page {currentPage} of {Math.max(1, Math.ceil(products.length / PAGE_SIZE))}</div>

                        <div className="flex items-center justify-center flex-wrap gap-2">
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

                            {(() => {
                                const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
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
                                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(products.length / PAGE_SIZE), p + 1))}
                                disabled={currentPage >= Math.ceil(products.length / PAGE_SIZE)}
                                className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50"
                            >Next</button>

                            <button
                                onClick={() => setCurrentPage(Math.ceil(products.length / PAGE_SIZE))}
                                disabled={currentPage >= Math.ceil(products.length / PAGE_SIZE)}
                                className="px-3 py-1 text-sm bg-white border rounded disabled:opacity-50"
                            >Last</button>
                        </div>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
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
        </>
    );
}
