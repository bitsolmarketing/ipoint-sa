import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Mail, Phone, MapPin, Send, HelpCircle, Star } from 'lucide-react';

export default function Contact() {
    const { data, setData, post, processing, wasSuccessful, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would submit to a feedback endpoint.
        // Here we just display a success alert to verify functionality.
        alert('Thank you for getting in touch! Our support representatives will contact you shortly.');
        reset();
    };

    return (
        <StorefrontLayout>
            <Head title="Contact Us & Get in Touch — iPoint" />

            {/* Header Jumbotron */}
            <div className="bg-page dark:bg-surface-dark py-20 border-b border-line-light dark:border-gray-800">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Get In Touch</span>
                    <h1 className="text-4xl font-extrabold text-heading dark:text-white tracking-tight mt-3">
                        We're here to help.
                    </h1>
                    <p className="text-sm text-muted dark:text-subtle mt-4 max-w-xl mx-auto leading-relaxed">
                        Have a question about product compatibility, trade-ins, or order status? Choose any way below to contact our team.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 font-sans">
                {/* 1. Contact Information Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-3xl p-8 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Information</h3>
                        
                        <div className="flex items-start space-x-4 text-xs">
                            <Phone className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-gray-850 dark:text-white">Call Us</p>
                                <p className="text-muted dark:text-subtle mt-1">0800 123 4567 (Toll Free)</p>
                                <p className="text-[10px] text-subtle mt-0.5">Mon - Fri: 8am - 6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 text-xs pt-4 border-t border-gray-100 dark:border-gray-800/80">
                            <Mail className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-gray-850 dark:text-white">Email Support</p>
                                <p className="text-muted dark:text-subtle mt-1">support@ipoint.co.za</p>
                                <p className="text-[10px] text-subtle mt-0.5">Response within 24 hours.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 text-xs pt-4 border-t border-gray-100 dark:border-gray-800/80">
                            <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-gray-850 dark:text-white">Our Store</p>
                                <p className="text-muted dark:text-subtle mt-1">
                                    Village Green Shopping Centre,<br />
                                    Greenside,<br />
                                    Johannesburg, 2193
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-page dark:bg-surface-dark border border-gray-150 dark:border-gray-800 rounded-3xl p-8 text-center space-y-4">
                        <HelpCircle className="w-8 h-8 text-brand mx-auto" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Need Quick Answers?</h4>
                        <p className="text-[11px] text-subtle leading-relaxed">
                            Check order status instantly using our Order Tracking Modal in the top menu navigation bar.
                        </p>
                    </div>
                </div>

                {/* 2. Interactive Contact Form (Glass Effect) */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-3xl p-8 md:p-10 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Us a Message</h3>
                            <p className="text-xs text-subtle mt-1">Fill out the form details and our team will get in touch with you.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white/60 dark:bg-gray-850/60 text-heading dark:text-white"
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white/60 dark:bg-gray-850/60 text-heading dark:text-white"
                                        placeholder="e.g. john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Subject</label>
                                <input 
                                    type="text" 
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white/60 dark:bg-gray-850/60 text-heading dark:text-white"
                                    placeholder="e.g. Delivery Enquiry"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-subtle uppercase mb-1.5">Message / Inquiry Details</label>
                                <textarea 
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows="5"
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 bg-white/60 dark:bg-gray-850/60 text-heading dark:text-white"
                                    placeholder="Write details of your query..."
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-6 py-3 rounded-full flex items-center space-x-2 transition-transform hover:scale-[1.01]"
                            >
                                <Send className="w-4 h-4" />
                                <span>{processing ? 'Sending...' : 'Send Message'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
