import React from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ArrowLeft } from 'lucide-react';
import InputError from '@/Components/InputError';

export default function Checkout({ paymentMethods, bankAccount, paymentSettings }) {
    const { cart } = usePage().props;
    const cartItems = Object.values(cart || {});
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Guard against an empty list so the page still renders if every method has
    // been switched off in the admin panel.
    const methods = paymentMethods?.length ? paymentMethods : [];

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        city: '',
        postal_code: '',
        payment_method: methods[0]?.provider || '',
        card_number: '',
        card_expiry: '',
        card_cvv: ''
    });

    const selected = methods.find((m) => m.provider === data.payment_method) || null;

    /**
     * Only the inline card flow posts card fields. Everything else sends the
     * placeholder values the server ignores, matching the original behaviour.
     */
    const selectMethod = (method) => {
        setData((prev) => ({
            ...prev,
            payment_method: method.provider,
            card_number: method.flow === 'inline_card' ? '' : '0000000000000000',
            card_expiry: method.flow === 'inline_card' ? '' : '12/35',
            card_cvv: method.flow === 'inline_card' ? '' : '000',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout — Secure Payment" />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 font-sans">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-1.5 text-[11px] text-subtle mb-6" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-brand transition-colors font-medium">Home</Link>
                    <span className="text-gray-300">›</span>
                    <Link href="/cart" className="hover:text-brand transition-colors font-medium">Shopping Bag</Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-heading dark:text-white font-semibold">Checkout</span>
                </nav>

                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand mb-6">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Secure Checkout</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Shipping Information */}
                            <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850 flex items-center space-x-2">
                                    <Truck className="w-4 h-4 text-brand" />
                                    <span>Shipping Address</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                        <InputError message={errors.customer_name} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={data.customer_email}
                                            onChange={(e) => setData('customer_email', e.target.value)}
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                            placeholder="john@example.com"
                                            required
                                        />
                                        <InputError message={errors.customer_email} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Phone Number</label>
                                        <input 
                                            type="text" 
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                            placeholder="082 123 4567"
                                        />
                                        <InputError message={errors.customer_phone} className="mt-1" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Street Address</label>
                                        <textarea 
                                            value={data.shipping_address}
                                            onChange={(e) => setData('shipping_address', e.target.value)}
                                            rows="3"
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                            placeholder="Apartment/Suite, Street address, Suburb"
                                            required
                                        ></textarea>
                                        <InputError message={errors.shipping_address} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">City</label>
                                        <input 
                                            type="text" 
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                            placeholder="e.g. Johannesburg"
                                            required
                                        />
                                        <InputError message={errors.city} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Postal Code</label>
                                        <input 
                                            type="text" 
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                            placeholder="2000"
                                            required
                                        />
                                        <InputError message={errors.postal_code} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-5">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-855 flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4 text-brand" />
                                    <span>Choose Payment Method</span>
                                </h3>

                                {paymentSettings?.instructions && (
                                    <p className="text-[11px] text-body dark:text-subtle bg-brand-tint dark:bg-surface-dark-alt rounded-xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line">
                                        {paymentSettings.instructions}
                                    </p>
                                )}

                                {methods.length === 0 && (
                                    <p className="text-[11px] text-sale bg-sale/5 border border-sale/20 rounded-xl px-3.5 py-2.5">
                                        No payment method is available right now. Please contact us to complete your order.
                                    </p>
                                )}

                                {/* Payment methods come from Admin → Payments */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {methods.map((method) => (
                                        <label
                                            key={method.provider}
                                            className={`border rounded-2xl p-4 flex items-center space-x-3 cursor-pointer transition-all ${
                                                data.payment_method === method.provider
                                                    ? 'border-brand bg-brand-tint/30 text-brand dark:bg-blue-950/20 dark:text-blue-300 ring-2 ring-brand/20'
                                                    : 'border-gray-200 hover:border-gray-400 bg-white dark:bg-transparent text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value={method.provider}
                                                checked={data.payment_method === method.provider}
                                                onChange={() => selectMethod(method)}
                                                className="text-brand focus:ring-brand"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold flex items-center gap-1.5">
                                                    {method.label}
                                                    {method.is_test_mode && (
                                                        <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                            Test
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-subtle mt-0.5">{method.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <InputError message={errors.payment_method} />

                                {/* Hosted gateway — details are taken on the provider's page */}
                                {selected?.flow === 'redirect' && (
                                    <div className="flex items-start gap-2.5 pt-3 border-t border-gray-50 dark:border-gray-850 text-[11px] text-body dark:text-subtle">
                                        <ShieldCheck className="w-4 h-4 text-success flex-shrink-0 mt-px" />
                                        <p>
                                            You'll be taken to <span className="font-bold">{selected.label}</span> to complete payment
                                            securely, then returned here. We never see your card details.
                                        </p>
                                    </div>
                                )}

                                {/* Manual EFT — show where to pay */}
                                {selected?.provider === 'eft' && bankAccount && (
                                    <div className="pt-3 border-t border-gray-50 dark:border-gray-850">
                                        <p className="text-[10px] font-bold text-subtle uppercase mb-2">Our banking details</p>
                                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                                            <dt className="text-subtle">Account holder</dt>
                                            <dd className="font-semibold text-heading dark:text-white">{bankAccount.account_holder}</dd>

                                            <dt className="text-subtle">Bank</dt>
                                            <dd className="font-semibold text-heading dark:text-white">{bankAccount.bank_name}</dd>

                                            <dt className="text-subtle">Account number</dt>
                                            <dd className="font-mono font-semibold text-heading dark:text-white">{bankAccount.masked_account_number}</dd>

                                            {bankAccount.branch_code && (
                                                <>
                                                    <dt className="text-subtle">Branch code</dt>
                                                    <dd className="font-mono font-semibold text-heading dark:text-white">{bankAccount.branch_code}</dd>
                                                </>
                                            )}
                                        </dl>
                                        <p className="text-[10px] text-subtle mt-2.5 leading-relaxed">
                                            The full account number and your payment reference are shown on the confirmation page
                                            once your order is placed.
                                        </p>
                                    </div>
                                )}

                                {selected?.flow === 'inline_card' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-50 dark:border-gray-850">
                                        <div className="sm:col-span-3">
                                            <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Card Number</label>
                                            <input 
                                                type="text" 
                                                value={data.card_number}
                                                onChange={(e) => setData('card_number', e.target.value)}
                                                maxLength="19"
                                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                                placeholder="4111 2222 3333 4444"
                                                required
                                            />
                                            <InputError message={errors.card_number} className="mt-1" />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Expiration Date</label>
                                            <input 
                                                type="text" 
                                                value={data.card_expiry}
                                                onChange={(e) => setData('card_expiry', e.target.value)}
                                                maxLength="5"
                                                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-855 text-heading dark:text-white"
                                                placeholder="MM/YY"
                                                required
                                            />
                                            <InputError message={errors.card_expiry} className="mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">CVV / Security Code</label>
                                            <input 
                                                type="text" 
                                                value={data.card_cvv}
                                                onChange={(e) => setData('card_cvv', e.target.value)}
                                                maxLength="4"
                                                className="w-full text-xs border border-gray-200 dark:border-gray-850 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                                placeholder="123"
                                                required
                                            />
                                            <InputError message={errors.card_cvv} className="mt-1" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action CTA */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Link 
                                    href="/cart"
                                    className="text-xs font-bold text-subtle hover:text-gray-900 dark:hover:text-white flex items-center space-x-1.5"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Bag</span>
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || methods.length === 0}
                                    className={`w-full sm:w-auto px-8 py-3.5 text-xs font-semibold text-center text-white rounded-full bg-brand hover:bg-brand-hover transition-transform duration-300 hover:scale-[1.01] shadow-md ${
                                        processing || methods.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {processing ? 'Processing Order...' : 'Place Secure Order'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Side Panel Review */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
                                Review Items
                            </h3>

                            {/* Item list */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-60 overflow-y-auto pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center space-x-3.5">
                                        <div className="w-10 h-10 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center p-1 bg-white flex-shrink-0">
                                            <img src={item.image_path} alt={item.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate leading-snug">{item.name}</p>
                                            <p className="text-[9px] text-subtle mt-0.5">Qty: {item.quantity} • R {item.price.toLocaleString()}</p>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-900 dark:text-white flex-shrink-0">
                                            R {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 dark:border-gray-850 pt-4 space-y-2 text-xs">
                                <div className="flex justify-between text-muted">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">R {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 font-semibold uppercase">Free</span>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-850 pt-3 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                                    <span>Total Price</span>
                                    <span>R {subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Security features */}
                        <div className="bg-page dark:bg-surface-dark-alt rounded-3xl p-6 text-[10px] text-muted space-y-4 border border-transparent">
                            <div className="flex items-start space-x-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-300">SSL Encrypted Transaction</p>
                                    <p className="mt-0.5">Your personal card details are transmitted directly to payment gateways securely. We do not store card credentials.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
