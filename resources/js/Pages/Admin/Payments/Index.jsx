import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    CreditCard, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, ExternalLink,
    ShieldCheck, AlertTriangle, Landmark, Star, KeyRound, Save, Unplug,
} from 'lucide-react';
import InputError from '@/Components/InputError';

const STATUS_STYLES = {
    pending: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
    submitted: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const STATUS_LABELS = {
    pending: 'Not started',
    submitted: 'Awaiting approval',
    active: 'Approved',
    rejected: 'Rejected',
};

const inputClass =
    'w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white';

const labelClass = 'block text-[10px] font-bold text-gray-400 uppercase mb-1.5';

/**
 * One provider's onboarding + credential form. Credentials are kept in two
 * independent sets (live / sandbox) so flipping the mode switch never destroys
 * the other one.
 */
function GatewayCard({ gateway, isOpen, onToggle }) {
    const meta = gateway.meta;
    const hasFields = meta.fields.length > 0;

    const { data, setData, post, processing, errors } = useForm({
        label: gateway.label || '',
        description: gateway.description || '',
        is_enabled: gateway.is_enabled,
        is_test_mode: gateway.is_test_mode,
        merchant_status: gateway.merchant_status,
        merchant_notes: gateway.merchant_notes || '',
        sort_order: gateway.sort_order ?? 0,
        credentials: { ...gateway.credentials },
        test_credentials: { ...gateway.test_credentials },
    });

    const mode = data.is_test_mode ? 'test' : 'live';
    const credentialKey = data.is_test_mode ? 'test_credentials' : 'credentials';
    const savedSecrets = gateway.secrets_set[mode] || [];

    const setCredential = (key, value) =>
        setData(credentialKey, { ...data[credentialKey], [key]: value });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.payments.gateways.update', gateway.provider), { preserveScroll: true });
    };

    const handleDisconnect = () => {
        if (confirm(`Clear all saved credentials for ${gateway.label} and disable it?`)) {
            router.post(route('admin.payments.gateways.disconnect', gateway.provider), {}, { preserveScroll: true });
        }
    };

    return (
        <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
            {/* Summary row */}
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{gateway.label}</span>

                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[gateway.merchant_status]}`}>
                            {STATUS_LABELS[gateway.merchant_status]}
                        </span>

                        {gateway.is_enabled ? (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#0066CC]/10 text-[#0066CC]">
                                Live at checkout
                            </span>
                        ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                                Off
                            </span>
                        )}

                        {gateway.is_enabled && gateway.is_test_mode && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                Sandbox
                            </span>
                        )}

                        {hasFields && !gateway.is_configured && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                <AlertTriangle className="w-2.5 h-2.5" /> Incomplete
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 truncate">{gateway.description || meta.blurb}</p>
                </div>

                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            {isOpen && (
                <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 border-t border-gray-50 dark:border-gray-800 space-y-5">
                    {meta.onboarding_url && (
                        <a
                            href={meta.onboarding_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0066CC] hover:underline"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Open the {meta.label} merchant sign-up
                        </a>
                    )}

                    {meta.settlement && (
                        <p className="text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-850 rounded-xl px-3 py-2">
                            <span className="font-semibold">Settlement:</span> {meta.settlement}
                        </p>
                    )}

                    {/* Customer-facing presentation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Checkout label</label>
                            <input type="text" value={data.label} onChange={(e) => setData('label', e.target.value)} className={inputClass} />
                            <InputError message={errors.label} className="mt-1" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Checkout description</label>
                            <input
                                type="text"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={inputClass}
                                placeholder={meta.blurb}
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                    </div>

                    {/* Onboarding tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Merchant onboarding status</label>
                            <select value={data.merchant_status} onChange={(e) => setData('merchant_status', e.target.value)} className={inputClass}>
                                <option value="pending">Not started</option>
                                <option value="submitted">Application submitted</option>
                                <option value="active">Approved &amp; active</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <InputError message={errors.merchant_status} className="mt-1" />
                        </div>
                        <div>
                            <label className={labelClass}>Display order</label>
                            <input type="number" min="0" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} className={inputClass} />
                            <InputError message={errors.sort_order} className="mt-1" />
                        </div>
                        <div className="flex flex-col justify-end gap-2 pb-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={data.is_enabled}
                                    onChange={(e) => setData('is_enabled', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]"
                                />
                                Offer at checkout
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={data.is_test_mode}
                                    onChange={(e) => setData('is_test_mode', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]"
                                />
                                Sandbox / test mode
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Onboarding notes (internal)</label>
                        <textarea
                            rows={2}
                            value={data.merchant_notes}
                            onChange={(e) => setData('merchant_notes', e.target.value)}
                            className={inputClass}
                            placeholder="Application reference, account manager, outstanding FICA documents…"
                        />
                        <InputError message={errors.merchant_notes} className="mt-1" />
                    </div>

                    {/* Credentials */}
                    {hasFields && (
                        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5 text-[#0066CC]" />
                                <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                    {data.is_test_mode ? 'Sandbox credentials' : 'Live credentials'}
                                </h4>
                                <span className="text-[10px] text-gray-400">
                                    — {data.is_test_mode ? 'used while test mode is on' : 'used for real transactions'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meta.fields.map((field) => {
                                    const isSecret = field.type === 'secret';
                                    const alreadySaved = savedSecrets.includes(field.key);

                                    return (
                                        <div key={field.key}>
                                            <label className={labelClass}>
                                                {field.label}
                                                {field.required && <span className="text-[#E30000] ml-0.5">*</span>}
                                            </label>
                                            <input
                                                type={isSecret ? 'password' : 'text'}
                                                autoComplete="off"
                                                spellCheck={false}
                                                value={data[credentialKey][field.key] || ''}
                                                onChange={(e) => setCredential(field.key, e.target.value)}
                                                className={inputClass}
                                                placeholder={alreadySaved ? '•••••••• saved — leave blank to keep' : field.hint}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 leading-snug">{field.hint}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-[10px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
                                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-green-600 mt-px" />
                                Secrets are encrypted before they are written to the database and are never sent back to this
                                page. Leave a secret blank to keep the value already stored.
                            </p>
                        </div>
                    )}

                    {!hasFields && (
                        <p className="text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-850 rounded-xl px-3 py-2">
                            No API credentials needed — this method is settled manually.
                            {gateway.provider === 'eft' && ' The bank account below is what the customer will be shown.'}
                        </p>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                        {hasFields ? (
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-[#E30000] transition-colors"
                            >
                                <Unplug className="w-3.5 h-3.5" />
                                Clear credentials
                            </button>
                        ) : <span />}

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold rounded-full inline-flex items-center gap-1.5"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function Index({ gateways, bankAccounts, checkout }) {
    const [openProvider, setOpenProvider] = useState(null);
    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const checkoutForm = useForm({
        instructions: checkout.instructions || '',
        show_bank_details_on_success: !!checkout.show_bank_details_on_success,
    });

    const bankForm = useForm({
        label: '',
        account_holder: '',
        bank_name: '',
        account_number: '',
        account_type: 'cheque',
        branch_code: '',
        swift_code: '',
        currency: 'ZAR',
        reference_prefix: '',
        is_primary: false,
        is_active: true,
    });

    const openBankModal = (account = null) => {
        setEditingAccount(account);
        bankForm.setData(
            account
                ? {
                      label: account.label || '',
                      account_holder: account.account_holder || '',
                      bank_name: account.bank_name || '',
                      // Never prefilled — the stored number is not sent to the browser.
                      // Leaving it blank on save keeps whatever is already on file.
                      account_number: '',
                      account_type: account.account_type || 'cheque',
                      branch_code: account.branch_code || '',
                      swift_code: account.swift_code || '',
                      currency: account.currency || 'ZAR',
                      reference_prefix: account.reference_prefix || '',
                      is_primary: !!account.is_primary,
                      is_active: !!account.is_active,
                  }
                : {
                      label: '', account_holder: '', bank_name: '', account_number: '',
                      account_type: 'cheque', branch_code: '', swift_code: '',
                      currency: 'ZAR', reference_prefix: '', is_primary: false, is_active: true,
                  }
        );
        setBankModalOpen(true);
    };

    const closeBankModal = () => {
        setBankModalOpen(false);
        setEditingAccount(null);
        bankForm.reset();
        bankForm.clearErrors();
    };

    const submitBank = (e) => {
        e.preventDefault();
        const onSuccess = () => closeBankModal();

        if (editingAccount) {
            bankForm.put(route('admin.payments.bank-accounts.update', editingAccount.id), { onSuccess });
        } else {
            bankForm.post(route('admin.payments.bank-accounts.store'), { onSuccess });
        }
    };

    const deleteBank = (id) => {
        if (confirm('Remove this bank account?')) {
            router.delete(route('admin.payments.bank-accounts.destroy', id), { preserveScroll: true });
        }
    };

    const submitCheckout = (e) => {
        e.preventDefault();
        checkoutForm.post(route('admin.payments.checkout.update'), { preserveScroll: true });
    };

    const enabledCount = gateways.filter((g) => g.is_enabled).length;

    return (
        <AdminLayout>
            <Head title="Payment Settings" />

            <div className="space-y-6 font-sans">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#0066CC]" />
                        Payments
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Merchant onboarding, gateway credentials and the bank account used for EFT settlement.
                        {' '}<span className="font-semibold text-gray-500">{enabledCount} method{enabledCount === 1 ? '' : 's'} live at checkout.</span>
                    </p>
                </div>

                {/* Gateways */}
                <div className="space-y-3">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Payment methods</h2>
                    {gateways.map((gateway) => (
                        <GatewayCard
                            key={gateway.provider}
                            gateway={gateway}
                            isOpen={openProvider === gateway.provider}
                            onToggle={() => setOpenProvider(openProvider === gateway.provider ? null : gateway.provider)}
                        />
                    ))}
                </div>

                {/* Bank accounts */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-[#0066CC]" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Bank credentials</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">Where EFT payments and gateway settlements land.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openBankModal()}
                            className="bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add account
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-6 font-semibold">Account</th>
                                    <th className="py-3 px-6 font-semibold">Bank</th>
                                    <th className="py-3 px-6 font-semibold">Number</th>
                                    <th className="py-3 px-6 font-semibold text-center">Branch</th>
                                    <th className="py-3 px-6 font-semibold text-center">Currency</th>
                                    <th className="py-3 px-6 font-semibold text-center">Status</th>
                                    <th className="py-3 px-6 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-855">
                                {bankAccounts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-gray-400">
                                            No bank account yet. Add one so EFT customers know where to pay.
                                        </td>
                                    </tr>
                                )}
                                {bankAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                                        <td className="py-3 px-6">
                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                {account.is_primary && <Star className="w-3 h-3 text-[#E3B341] fill-[#E3B341]" />}
                                                {account.account_holder}
                                            </div>
                                            {account.label && <div className="text-[10px] text-gray-400 mt-0.5">{account.label}</div>}
                                        </td>
                                        <td className="py-3 px-6 text-gray-500">{account.bank_name}</td>
                                        <td className="py-3 px-6 font-mono text-gray-500">{account.masked_account_number}</td>
                                        <td className="py-3 px-6 text-center font-mono text-gray-500">{account.branch_code || '—'}</td>
                                        <td className="py-3 px-6 text-center text-gray-500">{account.currency}</td>
                                        <td className="py-3 px-6 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                account.is_active
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                                {account.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center justify-center space-x-2.5">
                                                <button onClick={() => openBankModal(account)} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteBank(account.id)} className="p-1 rounded-full text-gray-400 hover:text-[#E30000]" title="Remove">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Checkout copy */}
                <form onSubmit={submitCheckout} className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 space-y-4">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Checkout instructions</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Shown to the customer on the payment step and the order confirmation.</p>
                    </div>

                    <div>
                        <label className={labelClass}>Payment instructions</label>
                        <textarea
                            rows={3}
                            value={checkoutForm.data.instructions}
                            onChange={(e) => checkoutForm.setData('instructions', e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Use your order number as the payment reference. Orders ship once payment reflects."
                        />
                        <InputError message={checkoutForm.errors.instructions} className="mt-1" />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={checkoutForm.data.show_bank_details_on_success}
                            onChange={(e) => checkoutForm.setData('show_bank_details_on_success', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]"
                        />
                        Show the primary bank account on the order confirmation page
                    </label>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={checkoutForm.processing}
                            className="px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold rounded-full"
                        >
                            {checkoutForm.processing ? 'Saving…' : 'Save instructions'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Bank account modal */}
            {bankModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={closeBankModal} />
                    <div className="w-full max-w-2xl bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden font-sans max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {editingAccount ? 'Edit bank account' : 'Add bank account'}
                            </h3>
                            <button onClick={closeBankModal} className="p-1 rounded-full text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitBank} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Account holder *</label>
                                    <input type="text" value={bankForm.data.account_holder} onChange={(e) => bankForm.setData('account_holder', e.target.value)} className={inputClass} required />
                                    <InputError message={bankForm.errors.account_holder} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Internal label</label>
                                    <input type="text" value={bankForm.data.label} onChange={(e) => bankForm.setData('label', e.target.value)} className={inputClass} placeholder="Primary ZAR settlement" />
                                    <InputError message={bankForm.errors.label} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Bank *</label>
                                    <input type="text" value={bankForm.data.bank_name} onChange={(e) => bankForm.setData('bank_name', e.target.value)} className={inputClass} placeholder="FNB / Standard Bank / Nedbank" required />
                                    <InputError message={bankForm.errors.bank_name} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Account number {editingAccount ? '' : '*'}
                                    </label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={bankForm.data.account_number}
                                        onChange={(e) => bankForm.setData('account_number', e.target.value)}
                                        className={`${inputClass} font-mono`}
                                        placeholder={editingAccount ? `${editingAccount.masked_account_number} — leave blank to keep` : ''}
                                        required={!editingAccount}
                                    />
                                    <InputError message={bankForm.errors.account_number} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Account type</label>
                                    <select value={bankForm.data.account_type} onChange={(e) => bankForm.setData('account_type', e.target.value)} className={inputClass}>
                                        <option value="cheque">Cheque / current</option>
                                        <option value="savings">Savings</option>
                                        <option value="business">Business</option>
                                        <option value="transmission">Transmission</option>
                                    </select>
                                    <InputError message={bankForm.errors.account_type} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Branch code</label>
                                    <input type="text" value={bankForm.data.branch_code} onChange={(e) => bankForm.setData('branch_code', e.target.value)} className={`${inputClass} font-mono`} placeholder="250655" />
                                    <InputError message={bankForm.errors.branch_code} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>SWIFT / BIC</label>
                                    <input type="text" value={bankForm.data.swift_code} onChange={(e) => bankForm.setData('swift_code', e.target.value)} className={`${inputClass} font-mono uppercase`} placeholder="FIRNZAJJ" />
                                    <InputError message={bankForm.errors.swift_code} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Currency *</label>
                                    <input type="text" maxLength={3} value={bankForm.data.currency} onChange={(e) => bankForm.setData('currency', e.target.value.toUpperCase())} className={`${inputClass} uppercase`} required />
                                    <InputError message={bankForm.errors.currency} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Payment reference prefix</label>
                                    <input type="text" value={bankForm.data.reference_prefix} onChange={(e) => bankForm.setData('reference_prefix', e.target.value)} className={inputClass} placeholder="IPT-" />
                                    <p className="text-[10px] text-gray-400 mt-1">Prepended to the order number the customer uses as their reference.</p>
                                    <InputError message={bankForm.errors.reference_prefix} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-5 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={bankForm.data.is_primary} onChange={(e) => bankForm.setData('is_primary', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                    Primary settlement account
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={bankForm.data.is_active} onChange={(e) => bankForm.setData('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#0066CC]" />
                                    Active
                                </label>
                            </div>

                            <p className="text-[10px] text-gray-400 flex items-start gap-1.5 leading-relaxed pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-green-600 mt-px" />
                                The account number is encrypted in the database. Customers only ever see the last four digits.
                            </p>

                            <div className="pt-3 flex justify-end space-x-3">
                                <button type="button" onClick={closeBankModal} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
                                    Cancel
                                </button>
                                <button type="submit" disabled={bankForm.processing} className="px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] disabled:opacity-60 text-white text-xs font-semibold rounded-full">
                                    {bankForm.processing ? 'Saving…' : 'Save account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
