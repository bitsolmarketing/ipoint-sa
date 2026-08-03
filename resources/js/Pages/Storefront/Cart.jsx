import React from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Cart() {
    const { cart } = usePage().props;
    const { post } = useForm();

    const cartItems = Object.values(cart || {});
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const updateQuantity = (variantId, newQty) => {
        post(route('cart.update'), {
            data: {
                product_variant_id: variantId,
                quantity: newQty
            },
            preserveScroll: true
        });
    };

    const removeItem = (variantId) => {
        post(route('cart.remove'), {
            data: {
                product_variant_id: variantId
            },
            preserveScroll: true
        });
    };

    return (
        <StorefrontLayout>
            <Head title="Your Shopping Bag — iStore" />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 font-sans">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-1.5 text-[11px] text-subtle mb-6" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-brand transition-colors font-medium">Home</Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-heading dark:text-white font-semibold">Shopping Bag</span>
                </nav>

                <h1 className="text-3xl font-extrabold text-heading dark:text-white tracking-tight mb-8">
                    Review your Shopping Bag.
                </h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-16 text-center max-w-2xl mx-auto">
                        <ShoppingBag className="w-16 h-16 text-gray-300 stroke-[1.25] mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Shopping Bag is empty.</h2>
                        <p className="text-xs text-subtle mt-2">Find your favorite Apple products and accessories and add them here.</p>
                        <Link 
                            href="/"
                            className="inline-block mt-8 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-6 py-3 rounded-full transition-transform hover:scale-[1.01]"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart items list */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-6 md:p-8 divide-y divide-gray-100 dark:divide-gray-800">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                                        {/* Image */}
                                        <div className="w-24 h-24 bg-white border border-gray-100 dark:border-gray-850 rounded-2xl flex items-center justify-center p-3 flex-shrink-0">
                                            <img src={item.image_path} alt={item.name} className="max-h-full max-w-full object-contain" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white max-w-md leading-snug">
                                                        {item.name}
                                                    </h3>
                                                    <span className="text-sm font-extrabold text-gray-900 dark:text-white ml-4">
                                                        R {(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-subtle mt-1 uppercase font-semibold tracking-wider">SKU: {item.sku}</p>
                                                
                                                {/* Meta Selection */}
                                                <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-muted">
                                                    {item.color && (
                                                        <span className="flex items-center space-x-1.5">
                                                            <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.color_hex }} />
                                                            <span>{item.color}</span>
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <span>• Size: {item.size}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity and Delete controls */}
                                            <div className="flex justify-between items-center mt-6">
                                                <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-full py-0.5 px-2 bg-gray-50 dark:bg-gray-850">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-1 text-subtle hover:text-body dark:hover:text-white"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-xs font-bold px-3 text-gray-800 dark:text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="p-1 text-subtle hover:text-body dark:hover:text-white"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-subtle hover:text-sale flex items-center space-x-1.5 text-xs font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link 
                                href="/"
                                className="inline-flex items-center space-x-2 text-xs font-bold text-brand hover:underline mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Continue Shopping</span>
                            </Link>
                        </div>

                        {/* Summary Sidepanel */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-surface-dark border border-gray-155 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
                                    Order Summary
                                </h3>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex justify-between text-muted">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">R {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>Shipping</span>
                                        <span className="text-emerald-500 font-semibold uppercase">Free</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>VAT (15%)</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            R {Math.round(subtotal * 0.15).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-850 pt-4 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                                    <span>Total Price</span>
                                    <span>R {subtotal.toLocaleString()}</span>
                                </div>

                                {/* Promo mock coupon code */}
                                <div className="pt-2">
                                    <form className="flex border border-gray-200 dark:border-gray-850 rounded-xl overflow-hidden" onSubmit={(e) => e.preventDefault()}>
                                        <input 
                                            type="text" 
                                            placeholder="Promo Code" 
                                            className="w-full text-xs px-3 py-2 border-none focus:ring-0 focus:outline-none bg-gray-50 dark:bg-gray-850 text-heading dark:text-white"
                                        />
                                        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 text-xs font-semibold border-l border-gray-200 dark:border-gray-850">
                                            Apply
                                        </button>
                                    </form>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full text-center bg-brand hover:bg-brand-hover text-white text-xs font-semibold py-3.5 rounded-full block transition-transform hover:scale-[1.01] shadow-md"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>

                            {/* Additional info */}
                            <div className="bg-page dark:bg-surface-dark-alt rounded-3xl p-6 border border-transparent text-[11px] text-muted space-y-2">
                                <p className="font-bold text-gray-800 dark:text-gray-300">Need help with checkout?</p>
                                <p>Call iStore Customer Service at 087 2100 200 (Monday - Friday 8am - 5pm).</p>
                                <p>Free returns are available within 7 days of delivery. Terms & Conditions apply.</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </StorefrontLayout>
    );
}
