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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 border-b">
                <div>
                    <h3 className="text-lg font-black text-gray-900">Orders</h3>
                    <p className="text-xs text-gray-500">Recent orders and quick actions</p>
                </div>
                <div className="flex items-center gap-3">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by order ID, email or name" className="px-3 py-2 border rounded text-sm" />
                    <button onClick={() => fetchOrders()} className="px-3 py-2 bg-gray-900 text-white rounded">Refresh</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Order</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">SKU(s)</th>
                            <th className="px-6 py-3">Items</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Payment</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-8 text-center text-gray-400">No orders found</td>
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
                                    <tr key={o.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-700">{o.id.split('-')[0]}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {email ? (
                                                <a href={emailHref} className="hover:underline text-blue-600">{email}</a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {phoneDigits ? (
                                                <a href={phoneHref} className="hover:underline text-blue-600">{rawPhone}</a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{skus || 'N/A'}</td>
                                        <td className="px-6 py-4">{(o.items || []).length}</td>
                                        <td className="px-6 py-4 font-bold">INR {o.total_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${o.status === 'shipped' ? 'bg-green-50 text-green-700' : o.status === 'processing' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${o.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                                                {o.payment_status || 'unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedOrder(o)} className="px-3 py-1 bg-blue-50 text-blue-700 rounded">View</button>
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
