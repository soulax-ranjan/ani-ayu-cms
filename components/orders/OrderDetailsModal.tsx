"use client";

import React, { useState } from 'react';
import { API_BASE_URL } from '../../lib/config';

export default function OrderDetailsModal({ order, onClose, onUpdate }: { order: any; onClose: () => void; onUpdate?: () => void }) {
    if (!order) return null;

    const address = order.address || {};
    const [status, setStatus] = useState<string>(order.status || 'pending');
    const [saving, setSaving] = useState(false);

    const updateStatus = async () => {
        if (!status) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${order.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', accept: 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to update status');
            }
            // optimistic update
            order.status = status;
            if (onUpdate) onUpdate();
            alert('Status updated');
        } catch (err: any) {
            alert(err?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };
    

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 md:p-10 bg-black/60" onClick={onClose}>
            <div className="md-card w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Order {String(order.id).split('-')[0]}</h3>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                        <div className="text-xs text-gray-400 mt-1">ID: {order.id}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="md-input py-1.5">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button onClick={updateStatus} disabled={saving} className="md-btn-primary px-4 py-1.5 text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Update Status'}</button>
                        </div>
                        <button onClick={onClose} className="md-btn-outlined px-4 py-1.5 text-sm">Close</button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Customer</div>
                            <div className="font-medium">{address.full_name || order.guest_email || 'Guest'}</div>
                            <div className="text-sm text-gray-600">Email: {address.email || order.guest_email || 'N/A'}</div>
                            <div className="text-sm text-gray-600">Phone: {address.phone || 'N/A'}</div>
                            <div className="text-xs text-gray-400 mt-2">Guest ID: {order.guest_id || '—'}</div>
                            <div className="text-xs text-gray-400">User ID: {order.user_id || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Shipping Address</div>
                            <div className="text-sm text-gray-700">{address.address_line1 || 'N/A'}</div>
                            {address.address_line2 && <div className="text-sm text-gray-700">{address.address_line2}</div>}
                            <div className="text-sm text-gray-700">{address.city || ''}{address.city && ','} {address.state || ''} {address.postal_code || ''}</div>
                            <div className="text-sm text-gray-700">{address.country || ''}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Payment</div>
                            <div className="font-bold">INR {order.total_amount?.toLocaleString() || 0}</div>
                            <div className="text-sm text-gray-600">Status: {order.payment_status || 'unknown'}</div>
                            <div className="text-xs text-gray-400 mt-2">Address ID: {order.address_id || '—'}</div>
                            <div className="text-xs text-gray-400">Updated: {order.updated_at ? new Date(order.updated_at).toLocaleString() : '—'}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-sm mb-3">Items</h4>
                        <div className="bg-gray-50 p-4 rounded">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead className="text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="py-2">Image</th>
                                        <th className="py-2">SKU</th>
                                        <th className="py-2">Product</th>
                                        <th className="py-2">Variant</th>
                                        <th className="py-2">Qty</th>
                                        <th className="py-2">Price</th>
                                        <th className="py-2">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((it: any) => (
                                        <tr key={it.id} className="border-t">
                                            <td className="py-2"><img src={it.product?.image_url} alt="" className="h-10 w-10 object-cover rounded" /></td>
                                            <td className="py-2 font-mono text-xs">{it.product?.sku || '—'}</td>
                                            <td className="py-2 font-medium">{it.product?.name || '—'}</td>
                                            <td className="py-2 text-sm">{(it.size ? `Size: ${it.size}` : '')} {(it.color ? `• Color: ${it.color}` : '')}</td>
                                            <td className="py-2">{it.quantity}</td>
                                            <td className="py-2">INR {it.price_at_purchase?.toLocaleString()}</td>
                                            <td className="py-2 font-bold">INR {(it.price_at_purchase * it.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-sm mb-3">Payments</h4>
                        <div className="bg-gray-50 p-4 rounded">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead className="text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="py-2">Payment ID</th>
                                        <th className="py-2">Amount</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2">Gateway ID</th>
                                        <th className="py-2">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.payments || []).map((p: any) => (
                                        <tr key={p.id} className="border-t">
                                            <td className="py-2 font-mono text-xs">{p.id}</td>
                                            <td className="py-2">INR {p.amount?.toLocaleString()}</td>
                                            <td className="py-2">{p.status}</td>
                                            <td className="py-2">{p.razorpay_payment_id || p.razorpay_order_id || '—'}</td>
                                            <td className="py-2 text-xs text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Total</div>
                            <div className="font-black">INR {order.total_amount?.toLocaleString()}</div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
}
