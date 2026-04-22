'use client';

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../lib/config';

interface Category {
    id: string;
    name: string;
}

interface AddProductFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialValues?: any;
}

export default function AddProductForm({ onSuccess, onCancel, initialValues }: AddProductFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCats, setFetchingCats] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Basic Info
    const [name, setName] = useState(initialValues?.name || '');
    const [slug, setSlug] = useState(initialValues?.slug || '');
    const [brand, setBrand] = useState(initialValues?.brand || 'Ani & Ayu');
    const [categoryId, setCategoryId] = useState(initialValues?.category_id || '');
    const [section, setSection] = useState(initialValues?.section !== undefined ? String(initialValues.section) : '0');
    const [sku, setSku] = useState(initialValues?.sku || '');
    const [barcode, setBarcode] = useState(initialValues?.barcode || '');
    const [status, setStatus] = useState(initialValues?.status || 'active');

    // Content & Media
    const [description, setDescription] = useState(initialValues?.description || '');
    const [shortDescription, setShortDescription] = useState(initialValues?.short_description || initialValues?.description?.slice(0, 150) || '');
    const [videoUrl, setVideoUrl] = useState(initialValues?.video_url || '');
    const [imageUrl, setImageUrl] = useState(initialValues?.image_url || ''); // thumbnail url
    const [images, setImages] = useState<string[]>(initialValues?.images || []); // gallery images
    const [uploading, setUploading] = useState(false);
    const [deletingImages, setDeletingImages] = useState<string[]>([]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tags, setTags] = useState('');

    // Pricing & Inventory
    const [price, setPrice] = useState(initialValues?.price ? String(initialValues.price) : '');
    const [originalPrice, setOriginalPrice] = useState(initialValues?.original_price ? String(initialValues.original_price) : '');
    const [currency, setCurrency] = useState(initialValues?.currency || 'INR');
    const [stockQuantity, setStockQuantity] = useState(initialValues?.stock_quantity ? String(initialValues.stock_quantity) : '10');
    const [lowStockThreshold, setLowStockThreshold] = useState(initialValues?.low_stock_threshold ? String(initialValues.low_stock_threshold) : '5');
    const [inStock, setInStock] = useState(initialValues?.in_stock ?? true);
    const [featured, setFeatured] = useState(initialValues?.featured ?? false);
    const [customizable, setCustomizable] = useState(initialValues?.customizable ?? false);
    const [suggested, setSuggested] = useState(initialValues?.suggested ?? false);
    const [allProduct, setAllProduct] = useState(initialValues?.allProduct ?? false);

    // Attributes
    const [material, setMaterial] = useState(initialValues?.material || '');
    const [occasion, setOccasion] = useState(initialValues?.occasion || '');
    const [ageRange, setAgeRange] = useState(initialValues?.age_range || '');
    const toCommaString = (val: any) => Array.isArray(val) ? val.join(', ') : (typeof val === 'string' ? val : '');
    const [sizes, setSizes] = useState(toCommaString(initialValues?.sizes)); // comma separated
    const [colors, setColors] = useState(toCommaString(initialValues?.colors)); // comma separated
    const toFeaturesText = (val: any): string => {
        if (Array.isArray(val)) return val.join('\n');
        if (typeof val === 'string') return val;
        return '';
    };
    const [featuresText, setFeaturesText] = useState(toFeaturesText(initialValues?.features));

    // Shipping & Dimensions
    const [shippingWeight, setShippingWeight] = useState(initialValues?.shipping_weight ? String(initialValues.shipping_weight) : '');
    const [dimUnit, setDimUnit] = useState(initialValues?.dimensions?.unit || 'cm');
    const [dimWidth, setDimWidth] = useState(initialValues?.dimensions?.width ? String(initialValues.dimensions.width) : '');
    const [dimHeight, setDimHeight] = useState(initialValues?.dimensions?.height ? String(initialValues.dimensions.height) : '');
    const [dimLength, setDimLength] = useState(initialValues?.dimensions?.length ? String(initialValues.dimensions.length) : '');

    // Technical Specifications
    const [closureType, setClosureType] = useState(initialValues?.specifications?.closure_type || 'Buttons and ties');
    const [careInstructions, setCareInstructions] = useState(initialValues?.specifications?.care_instructions || 'Hand wash or dry clean only');
    const [countryOfOrigin, setCountryOfOrigin] = useState(initialValues?.specifications?.country_of_origin || 'India');
    const [fabricComposition, setFabricComposition] = useState(initialValues?.specifications?.fabric_composition || '100% Cotton');

    // SEO & Policies
    const [metaTitle, setMetaTitle] = useState(initialValues?.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(initialValues?.meta_description || '');
    const [metaKeywords, setMetaKeywords] = useState(toCommaString(initialValues?.meta_keywords));
    const [returnPolicy, setReturnPolicy] = useState(initialValues?.return_policy || '30-day return policy. Items must be unworn and in original condition.');
    const [warranty, setWarranty] = useState(initialValues?.warranty || '6 months warranty against manufacturing defects');

    // Size Chart Logic
    const AGE_GROUPS = ['2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years', '6-7 Years', '7-8 Years', '8-9 Years', '9-10 Years'];

    // Initialize size chart from existing specs or default
    const [sizeChart, setSizeChart] = useState<Record<string, { enabled: boolean, top_length: string, chest: string, bottom_length: string, waist: string }>>(() => {
        // Check for size_chart at root (new) or specifications (legacy)
        const existing = initialValues?.size_chart || initialValues?.specifications?.size_chart || {};

        const defaults: any = {
            '2-3 Years': { top_length: '7.00', chest: '23.00', bottom_length: '21.00', waist: '20.00' },
            '3-4 Years': { top_length: '7.00', chest: '23.50', bottom_length: '23.00', waist: '21.00' },
            '4-5 Years': { top_length: '8.00', chest: '24.00', bottom_length: '25.00', waist: '22.00' },
            '5-6 Years': { top_length: '9.00', chest: '25.00', bottom_length: '26.00', waist: '23.00' },
            '6-7 Years': { top_length: '9.00', chest: '26.00', bottom_length: '28.00', waist: '24.00' },
            '7-8 Years': { top_length: '10.00', chest: '27.00', bottom_length: '30.00', waist: '25.00' },
            '8-9 Years': { top_length: '10.00', chest: '28.50', bottom_length: '32.00', waist: '26.00' },
            '9-10 Years': { top_length: '11.00', chest: '30.00', bottom_length: '34.00', waist: '28.00' }
        };

        const map: any = {};
        AGE_GROUPS.forEach(age => {
            map[age] = existing[age] || {
                enabled: (Array.isArray(initialValues?.sizes) && initialValues.sizes.includes(age)) || false,
                top_length: defaults[age]?.top_length || '',
                chest: defaults[age]?.chest || '',
                bottom_length: defaults[age]?.bottom_length || '',
                waist: defaults[age]?.waist || ''
            };
        });
        return map;
    });

    // Sync sizes string when chart changes
    useEffect(() => {
        const active = AGE_GROUPS.filter(g => sizeChart[g]?.enabled);
        setSizes(active.join(', '));
    }, [sizeChart]);

    const updateSizeChart = (age: string, field: string, value: any) => {
        setSizeChart(prev => ({
            ...prev,
            [age]: { ...prev[age], [field]: value }
        }));
    };

    useEffect(() => {
        fetch(`${API_BASE_URL}/categories`)
            .then(res => res.json())
            .then(data => {
                setCategories(Array.isArray(data.categories) ? data.categories : []);
                setFetchingCats(false);
            })
            .catch(() => {
                setFetchingCats(false);
            });
    }, []);

    const handleNameChange = (val: string) => {
        setName(val);
        const generatedSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        setSlug(generatedSlug);

        // Auto-generate meta title
        if (!metaTitle || metaTitle === `${name} - Traditional Kids Ethnic Wear | Ani & Ayu`) {
            setMetaTitle(`${val} - Traditional Kids Ethnic Wear | Ani & Ayu`);
        }
    };

    // SKU auto-generation helpers
    const autoGeneratedSkuRef = useRef<string | null>(null);

    const randomHash = (len = 4) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let out = '';
        for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
        return out;
    };

    const makePrefix = (str: string, len = 3) => {
        if (!str) return 'XXX';
        const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (!cleaned) return 'XXX';
        return (cleaned + 'XXX').slice(0, len);
    };

    const getCategoryName = (id?: string) => {
        if (!id) return '';
        const cat = categories.find(c => c.id === id);
        return cat?.name || '';
    };

    const generateSku = () => {
        // Standard mechanism: AA (Brand) - Category - Product - Hash
        const brandPrefix = 'AA';
        const catName = getCategoryName(categoryId) || '';
        const cat = makePrefix(catName || categoryId || '', 3);
        const prod = makePrefix(name || '', 3);
        const hash = randomHash(4);

        const newSku = `${brandPrefix}-${cat}-${prod}-${hash}`;

        autoGeneratedSkuRef.current = newSku;
        setSku(newSku);
    };

    // Initialize auto-generated SKU marker from initial values.
    useEffect(() => {
        autoGeneratedSkuRef.current = initialValues?.sku || null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.sku]);

    // Re-generate SKU when name/brand/category change — for new or existing products —
    // but avoid overwriting if user manually edited SKU (we clear the ref on manual edits).
    useEffect(() => {
        if (!sku || sku === autoGeneratedSkuRef.current) {
            // If categories aren't loaded yet, defer until they are
            if (categoryId && categories.length === 0) return;
            generateSku();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, categoryId, categories]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`${API_BASE_URL}/upload/image`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');
                const data = await response.json();
                return data.url;
            });

            const newUrls = await Promise.all(uploadPromises);
            setImages(prev => [...prev, ...newUrls]);

            // If no thumbnail set, set the first uploaded one
            if (!imageUrl && newUrls.length > 0) {
                setImageUrl(newUrls[0]);
            }
        } catch (err: any) {
            setError('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = (url: string) => {
        setImages(prev => prev.filter(img => img !== url));
        if (imageUrl === url) {
            setImageUrl('');
        }
    };

    const tryDeleteVariant = async (variant: string) => {
        return fetch(`${API_BASE_URL}/upload/${encodeURIComponent(variant)}`, {
            method: 'DELETE',
            headers: { accept: 'application/json' },
        });
    };

    const deleteUploadApi = async (filePath: string) => {
        if (!filePath) return;
        setDeletingImages(prev => [...prev, filePath]);

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
            setImages(prev => prev.filter(img => img !== filePath));
            if (imageUrl === filePath) setImageUrl('');
        } else {
            setError((lastErr && (lastErr.message || JSON.stringify(lastErr))) || 'Failed to delete image');
        }

        setDeletingImages(prev => prev.filter(p => p !== filePath));
    };

    const handleSetThumbnail = (url: string) => {
        setImageUrl(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log('Preparing product payload...');
        if (!categoryId) {
            setError('Please select a category');
            setLoading(false);
            return;
        }

        if (!imageUrl) {
            setError('Please select a main thumbnail image from the gallery');
            setLoading(false);
            return;
        }

        const filteredImages = images.filter(img => img.trim() !== '');
        const discountPercent = Number(originalPrice) > Number(price)
            ? ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100
            : 0;

        try {
            const productData: any = {
                name,
                slug,
                brand,
                category_id: categoryId,
                section: Number(section) || 0,
                sku,
                barcode: barcode || null,
                status,

                description,
                short_description: shortDescription || description.slice(0, 150),
                image_url: imageUrl,
                images: filteredImages.length > 0 ? filteredImages : [imageUrl],
                tags: tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),

                price: Number(price),
                original_price: Number(originalPrice) || Number(price),
                discount_percent: discountPercent,
                currency,
                stock_quantity: Number(stockQuantity),
                low_stock_threshold: Number(lowStockThreshold),
                in_stock: Number(stockQuantity) > 0,
                featured,
                customizable,

                material,
                occasion,
                age_range: ageRange,
                sizes: sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''),
                colors: colors.split(',').map((c: string) => c.trim()).filter((c: string) => c !== ''),
                features: featuresText.split('\n').map((f: string) => f.replace(/^[\s\u2022\-\*\d\.]+/, '').trim()).filter((f: string) => f !== ''),

                shipping_weight: Number(shippingWeight) || 0,
                dimensions: {
                    unit: dimUnit,
                    width: Number(dimWidth) || 0,
                    height: Number(dimHeight) || 0,
                    length: Number(dimLength) || 0
                },

                specifications: {
                    closure_type: closureType,
                    care_instructions: careInstructions,
                    country_of_origin: countryOfOrigin,
                    fabric_composition: fabricComposition,
                    size_chart: sizeChart
                },

                size_chart: sizeChart,

                meta_title: metaTitle,
                meta_description: metaDescription,
                meta_keywords: metaKeywords,

                return_policy: returnPolicy,
                warranty: warranty,

                suggested,
                allProduct,

                rating: 5.0,
                review_count: 0
            };

            // Only add video_url if it's a valid-looking URL
            if (videoUrl && videoUrl.trim() !== '') {
                productData.video_url = videoUrl;
            }

            let response: Response;
            if (initialValues?.id) {
                response = await fetch(`${API_BASE_URL}/products/${initialValues.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });
            } else {
                response = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add product');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="compact-form bg-white p-5 rounded-xl shadow-md border border-gray-100 space-y-6 animate-in slide-in-from-top-4 duration-500 max-h-[85vh] overflow-y-auto custom-scrollbar max-w-[1100px] mx-auto">
            <div className="flex items-center justify-between border-b border-gray-50 pb-6 sticky top-0 bg-white z-10 transition-all">
                <div>
                    <h2 className="text-xl font-black text-gray-900">{initialValues?.id ? 'Edit Product' : 'New Product'}</h2>
                    <p className="text-xs text-gray-500 mt-1">Configure product fields.</p>
                </div>
                <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3 animate-shake">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            <div className="space-y-8 pb-8">
                {/* SECTION 1: IDENTITY & GENERAL */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 border-b border-gray-50 pb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Identity</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">General information and branding</p>
                    </div>
                    <div className="lg:col-span-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                                <input required type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Twin Set - Royal Blue" className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Brand</label>
                                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="md-input w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Slug</label>
                                <input required type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="md-input w-full font-mono" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="md-input w-full appearance-none">
                                    <option value="">{fetchingCats ? 'Loading...' : 'Select Category'}</option>
                                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">SKU</label>
                                <input required type="text" value={sku} onChange={(e) => { setSku(e.target.value); autoGeneratedSkuRef.current = null; }} placeholder="AY-XXXX" className="md-input w-full" />
                                <p className="text-xs text-gray-600 mt-1">Auto: Product + Brand + Category + 4-char hash — editable</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Barcode</label>
                                <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="000000000000" className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Section</label>
                                <input type="number" value={section} onChange={(e) => setSection(e.target.value)} placeholder="0" className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="md-input w-full appearance-none">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PRICING & INVENTORY */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 border-b border-gray-50 pb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Pricing & Inventory</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Manage stock and currency</p>
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sale Price</label>
                                <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Original Price</label>
                                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className="md-input w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                                <input required type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Low Stock Threshold</label>
                                <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="md-input w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 transition-all" />
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Featured Product</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input type="checkbox" checked={customizable} onChange={(e) => setCustomizable(e.target.checked)} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 transition-all" />
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Customizable</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input type="checkbox" checked={suggested} onChange={(e) => setSuggested(e.target.checked)} className="w-6 h-6 rounded-lg text-purple-600 focus:ring-purple-500 border-gray-300 transition-all" />
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Suggested</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input type="checkbox" checked={allProduct} onChange={(e) => setAllProduct(e.target.checked)} className="w-6 h-6 rounded-lg text-gray-700 focus:ring-gray-500 border-gray-300 transition-all" />
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">All Product</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: MEDIA & CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 border-b border-gray-50 pb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Media & Content</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Visuals and copy</p>
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                            <textarea rows={2} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Catchy summary..." className="md-input w-full resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Long Description</label>
                            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full product story..." className="md-input w-full resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Video URL (YouTube/Vimeo)</label>
                            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="md-input w-full" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gallery Images</label>
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                                    {uploading ? 'Processing...' : 'Add Images'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {images.map((url, idx) => (
                                    <div key={idx} onClick={() => setLightboxImage(url)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightboxImage(url); }} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${imageUrl === url ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'}`}>
                                        <img src={url} className="w-full h-full object-cover object-center block" />
                                        {/* cross button: delete via API if uploaded, otherwise remove locally */}
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const isUrl = typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'));
                                                if (isUrl) {
                                                    await deleteUploadApi(url);
                                                } else {
                                                    handleDeleteImage(url);
                                                }
                                            }}
                                            disabled={deletingImages.includes(url)}
                                            title="Delete image"
                                            className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-sm text-red-600 shadow"
                                        >
                                            {deletingImages.includes(url) ? '...' : '✕'}
                                        </button>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setImageUrl(url); }} className="w-full py-1.5 bg-white text-[8px] font-black uppercase rounded text-gray-900">Thumbnail</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: PRODUCT ATTRIBUTES */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 border-b border-gray-50 pb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Attributes</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Dimensions and variants</p>
                    </div>
                    <div className="lg:col-span-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Material</label>
                                <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Silk, Cotton" className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Occasion</label>
                                <input type="text" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Wedding" className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age Range</label>
                                <input type="text" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="3-12y" className="md-input w-full" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Size Chart (Inches)</label>
                            <div className="border border-gray-100 rounded-xl overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm whitespace-nowrap min-w-[500px]">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left w-10">Use</th>
                                            <th className="px-3 py-2 text-left">Age / Size</th>
                                            <th className="px-3 py-2 text-left">Top Length</th>
                                            <th className="px-3 py-2 text-left">Chest</th>
                                            <th className="px-3 py-2 text-left">Bottom Length</th>
                                            <th className="px-3 py-2 text-left">Waist</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {AGE_GROUPS.map((age) => (
                                            <tr key={age} className={sizeChart[age]?.enabled ? 'bg-blue-50/30' : 'bg-white'}>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={sizeChart[age]?.enabled || false}
                                                        onChange={(e) => updateSizeChart(age, 'enabled', e.target.checked)}
                                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 font-medium text-gray-900">{age}</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={sizeChart[age]?.top_length || ''}
                                                        onChange={(e) => updateSizeChart(age, 'top_length', e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-center text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={sizeChart[age]?.chest || ''}
                                                        onChange={(e) => updateSizeChart(age, 'chest', e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-center text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={sizeChart[age]?.bottom_length || ''}
                                                        onChange={(e) => updateSizeChart(age, 'bottom_length', e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-center text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={sizeChart[age]?.waist || ''}
                                                        onChange={(e) => updateSizeChart(age, 'waist', e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-center text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                                                        placeholder="-"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <input type="hidden" value={sizes} />
                            <p className="text-[10px] text-gray-400 pl-1">Selected sizes will appear in the product listing.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Colors (Comma separated)</label>
                            <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Royal Blue, Pink" className="md-input w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Key Features</label>
                            <p className="text-[10px] text-gray-400 ml-1">Each line = one bullet. Paste from ChatGPT directly.</p>
                            <textarea
                                rows={8}
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                placeholder={`Premium fabric quality\nEmbroidered details\nComfortable fit for kids\nMachine washable`}
                                className="md-input w-full resize-none"
                            />
                            {featuresText.trim() && (
                                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preview</p>
                                    {featuresText.split('\n').map((line, i) => {
                                        const clean = line.replace(/^[\s\u2022\-\*\d\.]+/, '').trim();
                                        if (!clean) return null;
                                        return (
                                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="text-blue-400 font-black mt-0.5">•</span>
                                                <span>{clean}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 5: SHIPPING & SPECIFICATIONS — temporarily commented out */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 border-b border-gray-50 pb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Shipping & Specs</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Logistics and technical</p>
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Weight (grams)</label>
                                <input type="number" value={shippingWeight} onChange={(e) => setShippingWeight(e.target.value)} className="md-input w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dimensions Unit</label>
                                <input type="text" value={dimUnit} onChange={(e) => setDimUnit(e.target.value)} className="md-input w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Width</label><input type="number" value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} className="w-full py-2 px-3 bg-gray-50 border border-gray-100 rounded-lg text-sm" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Height</label><input type="number" value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} className="w-full py-2 px-3 bg-gray-50 border border-gray-100 rounded-lg text-sm" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase">Length</label><input type="number" value={dimLength} onChange={(e) => setDimLength(e.target.value)} className="w-full py-2 px-3 bg-gray-50 border border-gray-100 rounded-lg text-sm" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Country of Origin</label>
                                <input type="text" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Closure Type</label>
                                <input type="text" value={closureType} onChange={(e) => setClosureType(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* SECTION 6: SEO & POLICIES — temporarily commented out */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">SEO & Policies</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Visibility and legal</p>
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Meta Title</label>
                            <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl font-semibold text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Meta Description</label>
                            <textarea rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Return Policy</label>
                            <input type="text" value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tags (Comma separated)</label>
                            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                        </div>
                    </div>
                </div> */}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 sticky bottom-0 bg-white/80 backdrop-blur-xl z-10 transition-all">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-500 font-semibold uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-900 text-white font-semibold uppercase tracking-widest rounded-xl hover:bg-gray-800 shadow active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
                    {loading ? 'Processing...' : (initialValues?.id ? 'Update Product' : 'Publish Product')}
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `}</style>
            <style jsx>{`
                .compact-form input,
                .compact-form select,
                .compact-form textarea {
                    padding: 0.5rem 0.75rem; /* px-3 py-2 */
                    border-radius: 0.5rem; /* rounded-xl */
                    font-size: 0.875rem; /* text-sm */
                }

                .compact-form button {
                    padding: 0.45rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                }

                /* ensure any existing larger radii are visually consistent */
                .compact-form .rounded-2xl,
                .compact-form .rounded-3xl {
                    border-radius: 0.5rem !important;
                }
            `}</style>
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
        </form>
    );
}
