'use client';

import { useEffect, useRef, useState } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
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
    sku: string;
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
    size_chart?: Record<string, {
        enabled: boolean;
        top_length?: string;
        chest?: string;
        bottom_length?: string;
        waist?: string;
    }>;
}

interface ProductDetailsModalProps {
    product: Product;
    onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Handle Escape key and initial scroll
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);

        // Force scroll to top on mount
        const timer = setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }, 100);

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
            clearTimeout(timer);
        };
    }, [onClose, product.id]); // Re-run if product changes

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-5xl md:my-auto rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 relative ring-1 ring-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Floating Scroll Buttons */}
                <div className="absolute right-6 bottom-40 z-[110] flex flex-col gap-4 pointer-events-none">
                    <button
                        onClick={scrollToTop}
                        className="p-4 bg-gray-900/90 backdrop-blur shadow-2xl border border-white/10 rounded-2xl text-white hover:bg-black hover:scale-110 active:scale-95 transition-all group pointer-events-auto"
                        title="Scroll to Top"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={scrollToBottom}
                        className="p-4 bg-gray-900/90 backdrop-blur shadow-2xl border border-white/10 rounded-2xl text-white hover:bg-black hover:scale-110 active:scale-95 transition-all group pointer-events-auto"
                        title="Scroll to Bottom"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all group flex items-center gap-2 text-gray-500 hover:text-gray-900"
                            title="Back to products"
                        >
                            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-bold text-sm hidden sm:inline">Back</span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block" />
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{product.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{product.sku}</span>
                                {product.barcode && (
                                    <>
                                        <span className="text-xs text-gray-300">•</span>
                                        <span className="text-xs font-medium text-gray-400 font-mono">{product.barcode}</span>
                                    </>
                                )}
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500 font-medium capitalize">{product.brand}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-2xl transition-all border border-transparent hover:border-red-100"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>


                {/* Content with Custom Scrollbar */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar overscroll-contain min-h-0"
                >
                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: #f1f5f9;
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 10px;
                            border: 2px solid #f1f5f9;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}</style>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Image Gallery */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="aspect-[4/5] rounded-3xl bg-gray-50 overflow-hidden border border-gray-100 shadow-inner group relative">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    onClick={() => setZoomedImage(product.image_url)}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className="bg-white/90 backdrop-blur shadow-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold border border-white">
                                        Main View
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.slice(0, 4).map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setZoomedImage(img)}
                                        className="aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 hover:border-blue-500 transition-all cursor-pointer ring-offset-2 hover:ring-2 hover:ring-blue-500/20 cursor-zoom-in"
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Core Info */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase tracking-widest border ${product.status === 'active'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                    {product.status}
                                </span>
                                {product.featured && (
                                    <span className="px-3 py-1 text-xs font-black rounded-lg uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        Bestseller
                                    </span>
                                )}
                                {product.customizable && (
                                    <span className="px-3 py-1 text-xs font-black rounded-lg uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">
                                        Customizable
                                    </span>
                                )}
                                {product.suggested && (
                                    <span className="px-3 py-1 text-xs font-black rounded-lg uppercase tracking-widest bg-purple-50 text-purple-700 border border-purple-100">
                                        Suggested
                                    </span>
                                )}
                                {product.allProduct && (
                                    <span className="px-3 py-1 text-xs font-black rounded-lg uppercase tracking-widest bg-gray-50 text-gray-700 border border-gray-100">
                                        All
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="text-5xl font-black text-gray-900 tracking-tight">
                                    <span className="text-2xl align-top mr-1 font-bold text-gray-400">{product.currency}</span>
                                    {product.price.toLocaleString()}
                                </div>
                                {product.original_price > product.price && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl text-gray-400 line-through decoration-red-500/50">
                                            {product.currency} {product.original_price.toLocaleString()}
                                        </span>
                                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-black border border-red-100 italic">
                                            SAVE {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col relative overflow-hidden group">
                                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">In Stock</span>
                                    <span className="text-lg font-black text-blue-900">{product.stock_quantity} <span className="text-sm font-medium">Units</span></span>
                                    {product.stock_quantity <= product.low_stock_threshold && (
                                        <div className="absolute top-2 right-2 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex flex-col">
                                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1">Rating</span>
                                    <span className="text-lg font-black text-amber-900">{product.rating} <span className="text-sm font-medium">/ 5.0</span></span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Attributes & Shipping</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Material</div>
                                        <div className="text-xs font-bold text-gray-800">{product.material || 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Age</div>
                                        <div className="text-xs font-bold text-gray-800">{product.age_range || 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Weight</div>
                                        <div className="text-xs font-bold text-gray-800">{product.shipping_weight}g</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Dimensions</div>
                                        <div className="text-[10px] font-black text-gray-800">
                                            {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.length} {product.dimensions.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Available Sizes</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(size => (
                                            <span key={size} className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg text-xs font-black text-gray-700">
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Tabs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-6">
                        <div className="space-y-4 col-span-1">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                                Details
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm font-medium">{product.description}</p>
                            {product.video_url && (
                                <a
                                    href={product.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-red-600 font-bold text-xs hover:underline mt-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                    Watch Product Video
                                </a>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                                Specifications
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(product.specifications).map(([key, value]) => {
                                    // Legacy rendering of other specs, excluding size_chart if it was mistakenly nested there visualy
                                    if (key === 'size_chart') return null; // Handled separately below
                                    return (
                                        <div key={key} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                                            <span className="text-gray-400 font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-gray-800 font-bold">{String(value) || 'N/A'}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Top Level Size Chart Display */}
                            {(product.size_chart || (product.specifications as any).size_chart) && (
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                                        Size Chart
                                    </h4>
                                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 font-bold text-gray-500 uppercase">
                                                <tr>
                                                    <th className="px-3 py-2">Size</th>
                                                    <th className="px-3 py-2">Top Length</th>
                                                    <th className="px-3 py-2">Chest</th>
                                                    <th className="px-3 py-2">Btm Length</th>
                                                    <th className="px-3 py-2">Waist</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {Object.entries((product.size_chart || (product.specifications as any).size_chart) as any).map(([size, dims]: [string, any]) => {
                                                    if (!dims.enabled) return null;
                                                    return (
                                                        <tr key={size}>
                                                            <td className="px-3 py-2 font-bold text-gray-900">{size}</td>
                                                            <td className="px-3 py-2">{dims.top_length || '-'}</td>
                                                            <td className="px-3 py-2">{dims.chest || '-'}</td>
                                                            <td className="px-3 py-2">{dims.bottom_length || '-'}</td>
                                                            <td className="px-3 py-2">{dims.waist || '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                                Policies
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Return Policy</span>
                                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{product.return_policy}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Warranty</span>
                                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{product.warranty}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700">
                            <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        </div>
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            Key Highlights
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="mt-1 flex-shrink-0">
                                        <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-400" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SEO Insights Section */}
                    <div className="bg-blue-50/30 rounded-[2rem] border border-blue-100/50 p-8 space-y-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <span className="h-2 w-2 bg-blue-600 rounded-full" />
                            Digital Strategy (SEO)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Meta Title</span>
                                    <div className="p-4 bg-white rounded-2xl border border-gray-100 text-sm font-bold text-gray-900">{product.meta_title}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Keywords</span>
                                    <div className="p-4 bg-white rounded-2xl border border-gray-100 text-xs font-medium text-gray-600 italic">
                                        {product.meta_keywords}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Meta Description</span>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 text-sm font-medium text-gray-600 leading-relaxed h-[calc(100%-1.5rem)]">
                                    {product.meta_description}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-white border-t border-gray-100 flex justify-between items-center sticky bottom-0 z-10">
                    <div className="hidden sm:block">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Viewing Product</div>
                        <div className="text-sm font-black text-gray-900">{product.name}</div>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-all border border-gray-200"
                        >
                            Close
                        </button>
                        <button className="flex-1 sm:flex-none px-10 py-3.5 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95">
                            Edit Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Screen Image Viewer Overlay - Moved to Root for fixed Z-Index */}
            {
                zoomedImage && (
                    <div
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
                        onClick={() => setZoomedImage(null)}
                    >
                        <div className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                            <button
                                onClick={() => setZoomedImage(null)}
                                className="absolute -top-4 -right-4 md:top-6 md:right-6 p-4 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl transition-all border border-gray-200 z-[210] group shadow-2xl"
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <img
                                src={zoomedImage || ''}
                                alt="Full view"
                                className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl ring-1 ring-white/20"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <p className="absolute bottom-10 text-white/50 text-[10px] font-black uppercase tracking-widest hidden md:block">Click anywhere to close</p>
                    </div>
                )
            }
        </div >
    );
}
