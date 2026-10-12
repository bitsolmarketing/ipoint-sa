import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

const SECTIONS = [
    {
        title: 'Governing law',
        body: [
            'Our Terms and Conditions, Returns Policy and Privacy Policy, and any agreement or transaction concluded between iPOINT Apple and a customer through this website, shall be governed by and interpreted in accordance with the laws of the Republic of South Africa.',
        ],
    },
    {
        title: 'Electronic transactions',
        body: [
            'Without limiting the foregoing, electronic transactions and communications conducted through this website shall be subject to the Electronic Communications and Transactions Act 25 of 2002, as amended, together with all other applicable South African legislation.',
        ],
    },
    {
        title: 'Consumer protection and personal information',
        body: [
            'Where applicable, transactions with consumers shall also be subject to the Consumer Protection Act 68 of 2008, as amended, and the processing of personal information shall be governed by the Protection of Personal Information Act 4 of 2013, as amended.',
        ],
    },
    {
        title: 'Disputes and jurisdiction',
        body: [
            'Any dispute arising from or in connection with our Terms and Conditions, our policies or a transaction concluded through this website shall be dealt with in accordance with the applicable laws of the Republic of South Africa and before a court having lawful jurisdiction in South Africa.',
        ],
    },
];

export default function Governing() {
    return (
        <StorefrontLayout>
            <Head title="Governing Policy — iPoint" />

            {/* Header Jumbotron */}
            <div className="bg-page dark:bg-surface-dark py-20 border-b border-line-light dark:border-gray-800">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Legal Terms</span>
                    <h1 className="text-4xl font-extrabold text-heading dark:text-white tracking-tight mt-3">
                        Governing Policy
                    </h1>
                    <p className="text-xs text-subtle mt-2">
                        Governing law and jurisdiction
                    </p>
                </div>
            </div>

            {/* Policy Body */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 font-sans text-xs text-gray-700 dark:text-gray-300 space-y-8 leading-relaxed">
                <p className="text-subtle">
                    This Governing Policy sets out the law that applies to your use of this website and to every purchase,
                    repair booking or other transaction concluded with iPoint through it. It applies together with our{' '}
                    <Link href="/terms" className="text-brand font-semibold">Terms and Conditions</Link>,{' '}
                    <Link href="/returns" className="text-brand font-semibold">Returns Policy</Link> and{' '}
                    <Link href="/privacy" className="text-brand font-semibold">Privacy Policy</Link>. Nothing in this Policy
                    is intended to limit your statutory rights in any way.
                </p>

                {SECTIONS.map((section, index) => (
                    <section key={section.title} className="space-y-3">
                        <h2 className="text-base font-extrabold text-heading dark:text-white">
                            {index + 1}. {section.title}
                        </h2>
                        {section.body.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </section>
                ))}

                <p className="text-subtle pt-4 border-t border-line-light dark:border-gray-800">
                    Questions about this Policy?{' '}
                    <Link href="/contact" className="text-brand font-semibold">Contact us</Link>.
                </p>
            </div>
        </StorefrontLayout>
    );
}
