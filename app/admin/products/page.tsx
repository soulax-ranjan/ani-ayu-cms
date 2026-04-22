'use client';

import { useState } from 'react';
import ProductList from '../../../components/products/ProductList';
import AddProductForm from '../../../components/products/AddProductForm';

export default function ProductsPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
        setShowForm(false);
        setEditing(null);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products Management</h1>
            </header>

            <div key={refreshKey}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your catalog items and stock levels.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                    >
                        <svg className="w-5 h-5 transition-transform duration-300" style={{ transform: showForm ? 'rotate(45deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {showForm ? 'Close Editor' : 'Create Product'}
                    </button>
                </div>

                {showForm && (
                    <div className="mb-10">
                        <AddProductForm
                            onSuccess={handleRefresh}
                            onCancel={() => { setShowForm(false); setEditing(null); }}
                            initialValues={editing || undefined}
                        />
                    </div>
                )}

                <ProductList onEdit={(p) => { setEditing(p); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>

            {/* Floating Scroll Buttons */}
            <div className="fixed right-10 bottom-10 z-50 flex flex-col gap-3">
                <button
                    onClick={scrollToTop}
                    className="p-4 bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all group"
                    title="Scroll to Top"
                >
                    <svg className="w-6 h-6 shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                <button
                    onClick={scrollToBottom}
                    className="p-4 bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all group"
                    title="Scroll to Bottom"
                >
                    <svg className="w-6 h-6 shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
