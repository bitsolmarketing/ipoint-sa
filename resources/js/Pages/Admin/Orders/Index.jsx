import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Eye, Clock, ShieldCheck, Truck, XCircle } from 'lucide-react';

export default function Index({ orders }) {
    return (
        <AdminLayout>
            <Head title="Manage Orders" />

            <div className="space-y-6 font-sans">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Orders</h1>
                    <p className="text-xs text-gray-400 mt-1">Review customer sales, invoices, and update shipping details.</p>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-xs">No orders registered on the platform yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-855 bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6 font-semibold">Order ID</th>
                                        <th className="py-3.5 px-6 font-semibold">Customer</th>
                                        <th className="py-3.5 px-6 font-semibold">Address</th>
                                        <th className="py-3.5 px-6 font-semibold">Date Placed</th>
                                        <th className="py-3.5 px-6 font-semibold text-right">Total Price</th>
                                        <th className="py-3.5 px-6 font-semibold text-center">Status</th>
                                        <th className="py-3.5 px-6 font-semibold text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                                    {orders.map((order) => {
                                        const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        });

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                                                <td className="py-4 px-6 font-semibold text-[#0066CC]">
                                                    <Link href={`/admin/orders/${order.id}`}>#IPT-{(100000 + order.id)}</Link>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-gray-900 dark:text-white">{order.customer_name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{order.customer_email}</p>
                                                </td>
                                                <td className="py-4 px-6 text-gray-500 max-w-xs truncate" title={order.shipping_address}>
                                                    {order.shipping_address}, {order.city}
                                                </td>
                                                <td className="py-4 px-6 text-gray-500">{formattedDate}</td>
                                                <td className="py-4 px-6 text-right font-extrabold text-gray-900 dark:text-white">
                                                    R {parseFloat(order.total_amount).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-flex items-center space-x-1 ${
                                                        order.status === 'paid' 
                                                            ? 'bg-green-150 text-green-700 dark:bg-green-950/40 dark:text-green-300' 
                                                            : order.status === 'shipped'
                                                                ? 'bg-blue-150 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                                : order.status === 'cancelled'
                                                                    ? 'bg-red-150 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                                                    : 'bg-amber-150 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                    }`}>
                                                        {order.status === 'paid' && <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />}
                                                        {order.status === 'shipped' && <Truck className="w-2.5 h-2.5 mr-0.5" />}
                                                        {order.status === 'pending' && <Clock className="w-2.5 h-2.5 mr-0.5" />}
                                                        {order.status === 'cancelled' && <XCircle className="w-2.5 h-2.5 mr-0.5" />}
                                                        <span>{order.status}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <Link 
                                                        href={`/admin/orders/${order.id}`}
                                                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white inline-block"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
