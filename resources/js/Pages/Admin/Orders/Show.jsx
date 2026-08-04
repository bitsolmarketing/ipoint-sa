import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Clock, ShieldCheck, Truck, XCircle, FileText, Check } from 'lucide-react';

export default function Show({ order }) {
    const { data, setData, put, processing } = useForm({
        status: order.status
    });

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        put(route('admin.orders.update', order.id));
    };

    const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <AdminLayout>
            <Head title={`Order Details #IPT-${(100000 + order.id)}`} />

            <div className="space-y-6 font-sans">
                {/* Back Link */}
                <Link 
                    href="/admin/orders"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Orders</span>
                </Link>

                {/* Header details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Order #IPT-{(100000 + order.id)}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            <span>Placed on {formattedDate}</span>
                        </p>
                    </div>

                    {/* Status Update Form */}
                    <form onSubmit={handleStatusUpdate} className="flex items-center space-x-2 bg-white dark:bg-[#1D1D1F] border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-450 uppercase">Update Status:</span>
                        <select 
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="border-none bg-transparent p-0 text-xs font-bold focus:ring-0 focus:outline-none text-[#1d1d1f] dark:text-white mr-2"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="p-1.5 rounded-lg bg-[#0066CC] hover:bg-[#0077ED] text-white flex items-center justify-center transition-colors"
                            title="Save Status"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Items and Billing/Shipping details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Delivery particulars */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-3">
                                Customer Shipping Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                                <div>
                                    <p className="text-gray-400">Recipient Name</p>
                                    <p className="font-bold text-gray-900 dark:text-white mt-1">{order.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Recipient Email</p>
                                    <p className="font-semibold text-gray-800 dark:text-white mt-1 select-all">{order.customer_email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Contact Number</p>
                                    <p className="font-semibold text-gray-800 dark:text-white mt-1">{order.customer_phone || 'Not Provided'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">User Account link</p>
                                    <p className="font-semibold text-gray-850 dark:text-white mt-1">
                                        {order.user ? order.user.name : 'Guest Checkout'}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-gray-400">Street Shipping Address</p>
                                    <p className="font-bold text-gray-900 dark:text-white mt-1 leading-relaxed">
                                        {order.shipping_address}, {order.city}, {order.postal_code}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items row list */}
                        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-3">
                                Order Items
                            </h3>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 border border-gray-100 dark:border-gray-850 rounded-lg flex items-center justify-center p-1.5 bg-white flex-shrink-0">
                                                <img src={item.variant.product.image_path} alt={item.variant.product.name} className="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{item.variant.product.name}</p>
                                                <p className="text-[10px] text-[#0066CC] font-mono mt-0.5 uppercase">SKU: {item.variant.sku}</p>
                                                <div className="flex space-x-2 text-[10px] text-gray-400 mt-1">
                                                    {item.variant.color && (
                                                        <span className="flex items-center space-x-1">
                                                            <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.variant.color.hex_code }} />
                                                            <span>{item.variant.color.name}</span>
                                                        </span>
                                                    )}
                                                    {item.variant.size && <span>• Size: {item.variant.size.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">R {(item.price * item.quantity).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{item.quantity} x R {item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary card side */}
                    <div className="space-y-6">
                        <div className="bg-[#1D1D1F] text-white rounded-3xl p-6 space-y-6 shadow-lg">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-3">
                                Financial Details
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Total Charged</span>
                                    <span className="font-bold text-white">R {parseFloat(order.total_amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Shipping Fee</span>
                                    <span className="text-green-400 font-bold uppercase">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Transaction Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-flex items-center space-x-1 ${
                                        order.status === 'paid' 
                                            ? 'bg-green-950/40 text-green-400 border border-green-500/20' 
                                            : order.status === 'shipped'
                                                ? 'bg-blue-950/40 text-blue-405 border border-blue-500/20'
                                                : order.status === 'cancelled'
                                                    ? 'bg-red-950/40 text-red-400 border border-red-500/20'
                                                    : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                                    }`}>
                                        {order.status === 'paid' && <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />}
                                        {order.status === 'shipped' && <Truck className="w-2.5 h-2.5 mr-0.5" />}
                                        {order.status === 'pending' && <Clock className="w-2.5 h-2.5 mr-0.5" />}
                                        {order.status === 'cancelled' && <XCircle className="w-2.5 h-2.5 mr-0.5" />}
                                        <span>{order.status}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
