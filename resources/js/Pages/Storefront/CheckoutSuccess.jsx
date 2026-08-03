import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { CheckCircle, Truck, Package, ArrowRight, Calendar, Landmark, Clock } from 'lucide-react';

export default function CheckoutSuccess({ order, bankAccount, paymentInstructions }) {
    // An order awaiting a manual EFT is not "successful" yet — say so plainly
    // rather than telling the customer their transaction went through.
    const awaitingPayment = order.status === 'pending';
    const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <StorefrontLayout>
            <Head title="Order Confirmed — Thank You" />

            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-1.5 text-[11px] text-subtle mb-6" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-brand transition-colors font-medium">Home</Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-heading dark:text-white font-semibold">Order Confirmed</span>
                </nav>

                {/* Header message */}
                <div className="text-center pb-12 border-b border-gray-200 dark:border-gray-800">
                    {awaitingPayment ? (
                        <Clock className="w-16 h-16 text-gold mx-auto stroke-[1.25] mb-4" />
                    ) : (
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto stroke-[1.25] mb-4" />
                    )}
                    <h1 className="text-3xl font-extrabold text-heading dark:text-white tracking-tight">
                        Thank you for your order.
                    </h1>
                    <p className="text-xs text-muted dark:text-subtle mt-2 max-w-md mx-auto">
                        {awaitingPayment
                            ? 'Your order is reserved and will be processed as soon as your payment reflects.'
                            : 'Your transaction was successful.'}{' '}
                        We have sent a confirmation email containing invoice specifics to{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">{order.customer_email}</span>.
                    </p>
                </div>

                {/* Where to pay — shown for EFT and any other order still awaiting payment */}
                {bankAccount && (
                    <div className="mt-8 bg-brand-tint dark:bg-surface-dark border border-brand/20 rounded-3xl p-6 md:p-8">
                        <h3 className="text-xs font-bold text-brand uppercase tracking-widest flex items-center gap-2">
                            <Landmark className="w-4 h-4" />
                            Payment details
                        </h3>

                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-5 text-xs">
                            <div>
                                <dt className="text-muted dark:text-subtle">Account holder</dt>
                                <dd className="font-semibold text-heading dark:text-white mt-0.5">{bankAccount.account_holder}</dd>
                            </div>
                            <div>
                                <dt className="text-muted dark:text-subtle">Bank</dt>
                                <dd className="font-semibold text-heading dark:text-white mt-0.5">{bankAccount.bank_name}</dd>
                            </div>
                            <div>
                                <dt className="text-muted dark:text-subtle">Account number</dt>
                                <dd className="font-mono font-semibold text-heading dark:text-white mt-0.5">{bankAccount.masked_account_number}</dd>
                            </div>
                            {bankAccount.branch_code && (
                                <div>
                                    <dt className="text-muted dark:text-subtle">Branch code</dt>
                                    <dd className="font-mono font-semibold text-heading dark:text-white mt-0.5">{bankAccount.branch_code}</dd>
                                </div>
                            )}
                            {bankAccount.account_type && (
                                <div>
                                    <dt className="text-muted dark:text-subtle">Account type</dt>
                                    <dd className="font-semibold text-heading dark:text-white mt-0.5 capitalize">{bankAccount.account_type}</dd>
                                </div>
                            )}
                            {bankAccount.swift_code && (
                                <div>
                                    <dt className="text-muted dark:text-subtle">SWIFT / BIC</dt>
                                    <dd className="font-mono font-semibold text-heading dark:text-white mt-0.5">{bankAccount.swift_code}</dd>
                                </div>
                            )}
                        </dl>

                        {order.payment_reference && (
                            <div className="mt-5 pt-4 border-t border-brand/15">
                                <p className="text-[10px] font-bold text-muted dark:text-subtle uppercase tracking-wide">Use this payment reference</p>
                                <p className="font-mono text-lg font-extrabold text-brand mt-1">{order.payment_reference}</p>
                            </div>
                        )}

                        {paymentInstructions && (
                            <p className="text-[11px] text-body dark:text-subtle mt-4 leading-relaxed whitespace-pre-line">
                                {paymentInstructions}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
                    {/* Invoice Meta details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <h3 className="text-xs font-bold text-subtle uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-3">
                                Delivery Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-subtle">Recipient Name</p>
                                    <p className="font-semibold text-gray-800 dark:text-white mt-1">{order.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-subtle">Contact Number</p>
                                    <p className="font-semibold text-gray-800 dark:text-white mt-1">{order.customer_phone || 'Not Provided'}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-subtle">Shipping Address</p>
                                    <p className="font-semibold text-gray-850 dark:text-white mt-1 leading-relaxed">
                                        {order.shipping_address}, {order.city}, {order.postal_code}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items summary */}
                        <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <h3 className="text-xs font-bold text-subtle uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-3 flex items-center space-x-2">
                                <Package className="w-4 h-4 text-subtle" />
                                <span>Items in Shipment</span>
                            </h3>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 border border-gray-100 dark:border-gray-850 rounded-lg flex items-center justify-center p-1 bg-white flex-shrink-0">
                                                <img src={item.variant.product.image_path} alt={item.variant.product.name} className="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.variant.product.name}</p>
                                                <div className="flex space-x-2 text-[10px] text-subtle mt-0.5">
                                                    {item.variant.color && <span>Color: {item.variant.color.name}</span>}
                                                    {item.variant.size && <span>• Size: {item.variant.size.name}</span>}
                                                    <span>• Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            R {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order summary box */}
                    <div className="space-y-6">
                        <div className="bg-surface-dark text-white rounded-3xl p-6 space-y-6 shadow-lg">
                            <h3 className="text-[10px] font-bold text-subtle uppercase tracking-widest border-b border-white/10 pb-3">
                                Order Overview
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-start justify-between">
                                    <span className="text-subtle">Order Number</span>
                                    <span className="font-mono font-semibold text-right">#IST-{(100000 + order.id)}</span>
                                </div>
                                <div className="flex items-start justify-between">
                                    <span className="text-subtle">Date Placed</span>
                                    <span className="font-semibold text-right">{formattedDate}</span>
                                </div>
                                <div className="flex items-start justify-between">
                                    <span className="text-subtle">Status</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-semibold border border-emerald-500/20 text-[10px]">
                                        Secure Paid
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                                <span className="text-xs font-bold text-gray-300">Total Charged</span>
                                <span className="text-lg font-extrabold text-white">R {parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 text-[10px] text-muted space-y-3.5">
                            <div className="flex items-start space-x-2.5">
                                <Truck className="w-4 h-4 text-brand flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-300">Standard Delivery</p>
                                    <p className="mt-0.5">Expect dispatch within 24 hours. Delivery takes 2-4 working days depending on location.</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="w-full text-center bg-brand hover:bg-brand-hover text-white text-xs font-semibold py-3.5 rounded-full block transition-transform hover:scale-[1.01]"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
