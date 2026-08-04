import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { DollarSign, ShoppingCart, Laptop, Tag, ArrowRight, UserCheck } from 'lucide-react';

export default function Dashboard({ stats, recentOrders, monthlySales }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-8 font-sans">
                {/* Section Title */}
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Overview</h1>
                    <p className="text-xs text-gray-400 mt-1">Here is a snapshot of your store analytics.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#0066CC]">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales</span>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">R {stats.total_sales.toLocaleString()}</h3>
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">{stats.orders_count}</h3>
                        </div>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-500">
                            <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</span>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">{stats.products_count}</h3>
                        </div>
                    </div>

                    {/* Categories Card */}
                    <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categories</span>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">{stats.categories_count}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders List */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                Recent Transactions
                            </h3>
                            <Link href="/admin/orders" className="text-xs font-semibold text-[#0066CC] hover:underline flex items-center">
                                View all orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <p className="text-xs text-gray-400 py-6 text-center">No transactions registered yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-850 text-gray-400 uppercase tracking-wider">
                                            <th className="pb-3 font-semibold">Order</th>
                                            <th className="pb-3 font-semibold">Customer</th>
                                            <th className="pb-3 font-semibold text-right">Amount</th>
                                            <th className="pb-3 font-semibold text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                                                <td className="py-3.5 font-semibold text-[#0066CC]">
                                                    <Link href={`/admin/orders/${order.id}`}>#IPT-{(100000 + order.id)}</Link>
                                                </td>
                                                <td className="py-3.5">
                                                    <p className="font-bold text-gray-900 dark:text-white">{order.customer_name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{order.customer_email}</p>
                                                </td>
                                                <td className="py-3.5 text-right font-bold text-gray-900 dark:text-white">
                                                    R {parseFloat(order.total_amount).toLocaleString()}
                                                </td>
                                                <td className="py-3.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                        order.status === 'paid' 
                                                            ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300' 
                                                            : order.status === 'shipped'
                                                                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                                                                : order.status === 'cancelled'
                                                                    ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                                                                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Sales Metrics summary box */}
                    <div className="bg-[#1D1D1F] text-white rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-lg">
                        <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">System Info</span>
                            <h3 className="text-base font-bold text-white mt-1">Platform Operations</h3>
                            <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                                You are connected to the central iPoint administration. Product variant adjustments, colors, capacity constraints, and order shipments are logged live.
                            </p>
                        </div>
                        <div className="border-t border-white/10 pt-6 space-y-4 text-xs">
                            <div className="flex items-center justify-between text-gray-300">
                                <span className="flex items-center space-x-2">
                                    <UserCheck className="w-4 h-4 text-[#0066CC]" />
                                    <span>Primary Admin</span>
                                </span>
                                <span className="font-semibold text-white">Online</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-300">
                                <span>Version Control</span>
                                <span className="font-mono text-gray-400">Laravel v12.6</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
