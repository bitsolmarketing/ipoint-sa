import React from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-55 overflow-hidden font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white dark:bg-surface-dark shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                            <ShoppingBag className="w-5 h-5 text-heading dark:text-white" />
                            <h2 className="text-base font-semibold text-heading dark:text-white">Shopping Bag</h2>
                            {cartItems.length > 0 && (
                                <span className="bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full text-subtle hover:text-body dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-4 px-6 divide-y divide-gray-100 dark:divide-gray-800">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-muted">
                                <ShoppingBag className="w-12 h-12 stroke-[1.25] text-gray-300 mb-4" />
                                <p className="text-sm font-medium">Your shopping bag is empty</p>
                                <p className="text-xs text-subtle mt-1">Explore our products to add items.</p>
                                <button 
                                    onClick={onClose}
                                    className="mt-6 px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="py-4 flex space-x-4">
                                    <div className="flex-shrink-0 w-20 h-20 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white flex items-center justify-center p-2">
                                        <img 
                                            src={item.image_path} 
                                            alt={item.name} 
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                                                {item.name}
                                            </h4>
                                            <p className="text-[10px] text-muted dark:text-subtle mt-1 uppercase font-medium tracking-wider">
                                                SKU: {item.sku}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-full py-0.5 px-2 bg-gray-50 dark:bg-gray-800">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 text-subtle hover:text-body dark:hover:text-white"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-medium text-gray-800 dark:text-white px-2.5">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 text-subtle hover:text-body dark:hover:text-white"
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    R {(item.price * item.quantity).toLocaleString()}
                                                </span>
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-subtle hover:text-sale p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-6 bg-gray-50 dark:bg-gray-900">
                            <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                <span>Subtotal</span>
                                <span>R {subtotal.toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-subtle mb-6">Free shipping and delivery nationwide included.</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Link 
                                    href="/cart" 
                                    onClick={onClose}
                                    className="w-full text-center py-3 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    View Bag
                                </Link>
                                <Link 
                                    href="/checkout" 
                                    onClick={onClose}
                                    className="w-full text-center py-3 text-xs font-semibold rounded-full bg-brand hover:bg-brand-hover text-white transition-colors"
                                >
                                    Check Out
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
