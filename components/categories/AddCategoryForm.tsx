'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../../lib/config';

interface AddCategoryFormProps {
    onSuccess: () => void;
    // when provided, form acts as edit and prepopulates values
    initialValues?: { id?: string; name?: string; slug?: string; description?: string; featured?: boolean };
}

export default function AddCategoryForm({ onSuccess, onCancel, initialValues }: AddCategoryFormProps & { onCancel?: () => void }) {
    const [name, setName] = useState(initialValues?.name || '');
    const [slug, setSlug] = useState(initialValues?.slug || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [featured, setFeatured] = useState<boolean>(!!initialValues?.featured);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (val: string) => {
        setName(val);
        // Auto-generate slug: lowercase, replace spaces with hyphens, remove special characters
        const generatedSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        setSlug(generatedSlug);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let response: Response;
            if (initialValues?.id) {
                // Update existing category
                response = await fetch(`${API_BASE_URL}/categories/${initialValues.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, slug, description, featured }),
                });
            } else {
                // Create new category
                response = await fetch(`${API_BASE_URL}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, slug, description, featured }),
                });
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add category');
            }

            // Success! Reset form and notify parent
            setName('');
            setSlug('');
            setDescription('');
            setFeatured(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="md-card p-6 border-t-4 border-t-primary-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{initialValues?.id ? 'Edit Category' : 'Create New Category'}</h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-1.5">
                    <label className="text-gray-700 font-semibold">Category Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        className="md-input w-full"
                        placeholder="e.g. Trendy Collections"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-gray-700 font-semibold">URL Slug</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        className="md-input w-full"
                        placeholder="e.g. trendy-collections"
                    />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-gray-700 font-semibold">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="md-input w-full resize-none"
                        placeholder="Enter a brief description of this category..."
                    />
                </div>

                {/* Thumbnail removed — API accepts categories without image_url */}

                <div className="flex items-center gap-2 py-2">
                    <div className="flex items-center h-5">
                        <input
                            type="checkbox"
                            id="featured"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                    </div>
                    <label htmlFor="featured" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                        Promote to Featured Categories
                    </label>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                ) || (
                        <button
                            type="button"
                            onClick={() => {
                                setName('');
                                setSlug('');
                                setDescription('');
                                setFeatured(false);
                            }}
                            className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Reset
                        </button>
                    )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`md-btn-primary px-8 py-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                        </span>
                    ) : (initialValues?.id ? 'Update Category' : 'Save Category')}
                </button>
            </div>
        </form>
    );
}
