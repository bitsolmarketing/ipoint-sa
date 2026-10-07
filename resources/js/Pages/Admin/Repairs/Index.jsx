import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Wrench, MapPin, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import InputError from '@/Components/InputError';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABEL = {
    pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_STYLE = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    in_progress: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};
const REPAIR_TYPE_LABEL = { screen: 'Screen', battery: 'Battery', rear_housing: 'Rear Housing' };

function BookingRow({ booking }) {
    const [status, setStatus] = useState(booking.status);
    const [technician, setTechnician] = useState(booking.technician || '');
    const dirty = status !== booking.status || technician !== (booking.technician || '');

    const save = () => {
        router.put(route('admin.repairs.bookings.update', booking.id), { status, technician }, { preserveScroll: true });
    };

    return (
        <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 align-top">
            <td className="py-4 px-4 font-mono text-[10px] text-gray-500">{booking.reference}</td>
            <td className="py-4 px-4">
                <p className="font-bold text-gray-900 dark:text-white text-xs">{booking.customer_name}</p>
                <p className="text-[10px] text-gray-400">{booking.email}</p>
                {booking.phone && <p className="text-[10px] text-gray-400">{booking.phone}</p>}
            </td>
            <td className="py-4 px-4 text-xs text-gray-700 dark:text-gray-300">
                <p className="font-semibold">{REPAIR_TYPE_LABEL[booking.repair_type] || booking.repair_type}</p>
                <p className="text-[10px] text-gray-400">{booking.device_model}</p>
            </td>
            <td className="py-4 px-4 text-xs text-gray-700 dark:text-gray-300">
                <p>{booking.location ? booking.location.name : '—'}</p>
                <p className="text-[10px] text-gray-400">{booking.booking_date} · {booking.time_slot}</p>
            </td>
            <td className="py-4 px-4">
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className={`text-[10px] font-bold rounded-full px-2.5 py-1 border-none focus:ring-1 focus:ring-[#0066CC] ${STATUS_STYLE[status]}`}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
            </td>
            <td className="py-4 px-4">
                <input value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="Assign…"
                    className="w-28 text-[11px] border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-850 text-gray-900 dark:text-white" />
            </td>
            <td className="py-4 px-4 text-center">
                <button onClick={save} disabled={!dirty}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold ${dirty ? 'bg-[#0066CC] hover:bg-[#0077ED] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                    <Save className="w-3 h-3" /> Save
                </button>
            </td>
        </tr>
    );
}

export default function Index({ bookings, locations, status, statusCounts }) {
    const [isLocModalOpen, setIsLocModalOpen] = useState(false);
    const [editLoc, setEditLoc] = useState(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '', address: '', city: '', slot_capacity: 8, is_active: true,
    });

    const setFilter = (s) => router.get(route('admin.repairs.index'), { status: s }, { preserveState: true, preserveScroll: true });

    const openAddLoc = () => { reset(); setEditLoc(null); setIsLocModalOpen(true); };
    const openEditLoc = (loc) => {
        setEditLoc(loc);
        setData({ name: loc.name, address: loc.address || '', city: loc.city || '', slot_capacity: loc.slot_capacity, is_active: !!loc.is_active });
        setIsLocModalOpen(true);
    };
    const closeLoc = () => { setIsLocModalOpen(false); setEditLoc(null); reset(); };
    const submitLoc = (e) => {
        e.preventDefault();
        if (editLoc) put(route('admin.repairs.locations.update', editLoc.id), { onSuccess: closeLoc });
        else post(route('admin.repairs.locations.store'), { onSuccess: closeLoc });
    };
    const deleteLoc = (id) => { if (confirm('Remove this service location?')) router.delete(route('admin.repairs.locations.destroy', id), { preserveScroll: true }); };

    const filterTabs = [
        { key: 'all', label: 'All' }, ...STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s] })),
    ];

    return (
        <AdminLayout>
            <Head title="Repair Bookings" />

            <div className="space-y-8 font-sans">
                <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#0066CC]" />
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Repair Bookings</h1>
                        <p className="text-xs text-gray-400 mt-1">Track bookings, update status, and assign technicians.</p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1.5">
                    {filterTabs.map((t) => (
                        <button key={t.key} onClick={() => setFilter(t.key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${status === t.key ? 'bg-[#0066CC] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}>
                            {t.label} <span className="opacity-70">({statusCounts[t.key] ?? 0})</span>
                        </button>
                    ))}
                </div>

                {/* Bookings table */}
                <div className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4 font-semibold">Ref</th>
                                    <th className="py-3 px-4 font-semibold">Customer</th>
                                    <th className="py-3 px-4 font-semibold">Repair</th>
                                    <th className="py-3 px-4 font-semibold">Store / Slot</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Technician</th>
                                    <th className="py-3 px-4 font-semibold text-center">Save</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-855">
                                {bookings.length === 0 && (
                                    <tr><td colSpan="7" className="py-10 text-center text-gray-400">No bookings in this view.</td></tr>
                                )}
                                {bookings.map((b) => <BookingRow key={b.id} booking={b} />)}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Locations management */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#0066CC]" />
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Service Locations</h2>
                        </div>
                        <button onClick={openAddLoc} className="bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> Add Location
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map((loc) => (
                            <div key={loc.id} className="bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{loc.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${loc.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        {loc.is_active ? 'Active' : 'Off'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-850">
                                    <span className="text-[10px] text-gray-400">{loc.slot_capacity} slots/day</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditLoc(loc)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => deleteLoc(loc.id)} className="p-1 text-gray-400 hover:text-[#E30000]"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Location modal */}
            {isLocModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={closeLoc} />
                    <div className="w-full max-w-md bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden font-sans">
                        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{editLoc ? 'Edit Location' : 'Add Location'}</h3>
                            <button onClick={closeLoc} className="p-1 rounded-full text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={submitLoc} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Store Name</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white" placeholder="e.g. Village Green Shopping Centre" />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Address</label>
                                <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">City</label>
                                    <input type="text" value={data.city} onChange={(e) => setData('city', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Slots / Day</label>
                                    <input type="number" min="1" max="100" value={data.slot_capacity} onChange={(e) => setData('slot_capacity', e.target.value)}
                                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-850 text-[#1d1d1f] dark:text-white" />
                                    <InputError message={errors.slot_capacity} className="mt-1" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 rounded accent-[#0066CC]" />
                                Active (accepting bookings)
                            </label>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={closeLoc} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0066CC] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-full">{processing ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
