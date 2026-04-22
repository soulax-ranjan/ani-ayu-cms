'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../lib/config';
import OrderDetailsModal from './OrderDetailsModal';

interface ApiOrder {
    id: string;
    guest_email?: string | null;
    address?: { email?: string | null; full_name?: string | null } | null;
    status: string;
    payment_status?: string | null;
    total_amount: number;
    created_at: string;
    items?: any[];
}

export default function OrderList() {
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

    const fetchOrders = async (limit = 50, offset = 0) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/orders/all?limit=${limit}&offset=${offset}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(Array.isArray(data.orders) ? data.orders : []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const filtered = useMemo(() => {
        if (!query) return orders;
        const q = query.toLowerCase();
        return orders.filter(o => (
            o.id.toLowerCase().includes(q) ||
            (o.guest_email || o.address?.email || '').toLowerCase().includes(q) ||
            (o.address?.full_name || '').toLowerCase().includes(q)
        ));
    }, [orders, query]);

    if (loading) return <div className="text-center py-10 text-gray-400">Loading orders...</div>;
    if (error) return <div className="text-red-500 text-center py-10">Error: {error}</div>;

    return (
        <div className="md-card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Orders</h3>
                    <p className="text-sm text-gray-500 mt-1">Recent orders and quick actions</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="md-input w-full sm:w-64" />
                    <button onClick={() => fetchOrders()} className="md-btn-primary whitespace-nowrap">Refresh</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-500 uppercase bg-surface-variant/30 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Order</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Phone</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">SKU(s)</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Items</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Total</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Payment</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-gray-400">No orders found</td>
                            </tr>
                        ) : (
                            filtered.map((o) => {
                                const phone = o.address && (o as any).address.phone ? (o as any).address.phone : 'N/A';
                                const skus = (o.items || []).map((it: any) => it?.product?.sku).filter(Boolean).join(', ');
                                // prepare mailto and tel links
                                const email = (o.guest_email || (o.address && (o as any).address.email) || '').trim();
                                const emailHref = email ? `mailto:${encodeURIComponent(email)}` : undefined;
                                const rawPhone = (o.address && (o as any).address.phone) ? String((o as any).address.phone) : '';
                                const phoneDigits = rawPhone.replace(/[^+0-9]/g, '');
                                const phoneHref = phoneDigits ? `tel:${phoneDigits}` : undefined;

                                return (
                                    <tr key={o.id} className="hover:bg-primary-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-700">{o.id.split('-')[0]}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {email ? (
                                                <a href={emailHref} className="hover:underline text-primary-600">{email}</a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {phoneDigits ? (
                                                <a href={phoneHref} className="hover:underline text-primary-600">{rawPhone}</a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{skus || 'N/A'}</td>
                                        <td className="px-6 py-4">{(o.items || []).length}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">INR {o.total_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${o.status === 'shipped' ? 'bg-green-100 text-green-800' : o.status === 'processing' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {o.payment_status || 'unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedOrder(o)} className="md-btn-outlined py-1.5 px-4 text-sm whitespace-nowrap">View Details</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={() => fetchOrders()} />
            )}
        </div>
    );
}
