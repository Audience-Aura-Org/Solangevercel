'use client';

import { useEffect, useState } from 'react';

type Booking = {
    _id: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    service: string;
    date: string;
    time: string;
    status: 'confirmed' | 'completed' | 'cancelled';
    price: number;
    confirmationNumber: string;
    addons?: Array<{ name: string; price: number }>;
    notes?: string;
    hairColor?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    stripeSessionId?: string;
};

const STATUS_OPTIONS = ['confirmed', 'completed', 'cancelled'];

const statusStyle = (s: string) => {
    if (s === 'confirmed') return 'text-[#C5A059]';
    if (s === 'completed') return 'text-emerald-400';
    if (s === 'cancelled') return 'text-red-500/70';
    return 'text-[#404040]';
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [editModal, setEditModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
    const [detailModal, setDetailModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });

    const fetchBookings = async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/bookings?status=${filter}`);
        const data = await res.json();
        setBookings(data.bookings || []);
        setLoading(false);
    };

    useEffect(() => { fetchBookings(); }, [filter]);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(id);
        await fetch(`/api/admin/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        await fetchBookings();
        setUpdating(null);
    };

    const deleteBooking = async (id: string) => {
        if (!confirm('Permanently delete this booking?')) return;
        await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
        setBookings(prev => prev.filter(b => b._id !== id));
    };

    const filtered = bookings.filter(b =>
        b.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        b.clientEmail?.toLowerCase().includes(search.toLowerCase()) ||
        b.confirmationNumber?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 font-poppins px-6 py-10">

            {/* Header */}
            <div className="border-b border-[#141414] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] mb-3 font-poppins">Management</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#FDFBF7] tracking-tight leading-none">Reservations</h1>
                </div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-medium font-quicksand">
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between font-quicksand">
                <input
                    type="text"
                    placeholder="Search by name, email, or reference..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-b border-[#222] px-0 py-2 text-xs text-[#FDFBF7] placeholder-gray-600 focus:outline-none focus:border-[#C5A059] w-full sm:w-72 transition-colors"
                />
                <div className="flex gap-1">
                    {['all', 'confirmed', 'completed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] transition-all border-b-2 font-bold ${filter === s
                                ? 'border-[#C5A059] text-[#C5A059]'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Container - Fixed scrolling issue */}
            <div className="relative border border-[#141414] bg-[#060606] rounded-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-[#1A1A1A] max-h-[calc(100vh-200px)]">
                    {loading ? (
                        <div className="p-20 text-center text-[9px] uppercase tracking-[0.3em] text-gray-500 animate-pulse font-poppins">
                            Synchronizing archives...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-20 text-center text-[9px] uppercase tracking-[0.3em] text-gray-500 font-poppins">
                            No records found in this sequence.
                        </div>
                    ) : (
                        <table className="w-full min-w-[1000px] table-fixed text-[10px] sm:text-sm">
                            <thead>
                                <tr className="border-b border-[#141414] bg-[#0A0A0A]">
                                    <th className="w-[120px] px-6 py-5 text-left text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Reference</th>
                                    <th className="w-[200px] px-6 py-5 text-left text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Client</th>
                                    <th className="w-[200px] px-6 py-5 text-left text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Service Brief</th>
                                    <th className="w-[150px] px-6 py-5 text-left text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Schedule</th>
                                    <th className="w-[120px] px-6 py-5 text-left text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Status</th>
                                    <th className="w-[100px] px-6 py-5 text-left text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Price</th>
                                    <th className="w-[150px] px-6 py-5 text-right text-[8px] uppercase tracking-[0.3em] text-gray-500 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="font-quicksand">
                                {filtered.map((b, i) => (
                                    <tr
                                        key={b._id}
                                        className={`group hover:bg-[#0A0A0A] transition-colors ${i !== filtered.length - 1 ? 'border-b border-[#0E0E0E]' : ''}`}
                                    >
                                        <td className="px-6 py-6 text-[10px] font-mono text-gray-500 whitespace-nowrap">
                                            #{b.confirmationNumber?.slice(-8).toUpperCase() ?? '—'}
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-xs font-semibold text-[#FDFBF7] truncate">{b.clientName}</p>
                                            <p className="text-[10px] text-gray-500 truncate mt-0.5">{b.clientPhone || b.clientEmail}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-[10px] uppercase tracking-widest text-[#FDFBF7] font-bold leading-relaxed truncate">{b.service}</p>
                                            {b.hairColor && <p className="text-[9px] text-[#C5A059]/60 italic truncate mt-1">{b.hairColor}</p>}
                                            {b.addons && b.addons.length > 0 && (
                                                <p className="text-[9px] text-gray-500 truncate mt-1">Extras: {b.addons.map(a => a.name).join(', ')}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-6 text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} <span className="text-[#C5A059]/40 mx-1">/</span> {b.time}
                                        </td>
                                        <td className="px-6 py-6">
                                            <select
                                                value={b.status}
                                                disabled={updating === b._id}
                                                onChange={e => updateStatus(b._id, e.target.value)}
                                                className={`text-[9px] uppercase tracking-[0.2em] appearance-none bg-transparent focus:outline-none cursor-pointer font-bold ${statusStyle(b.status)}`}
                                            >
                                                {STATUS_OPTIONS.map(s => (
                                                    <option key={s} value={s} className="bg-[#111] text-white normal-case">{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-6 text-[11px] text-[#C5A059] font-serif tabular-nums font-bold">${b.price}</td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 transition-opacity">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`/api/admin/bookings/${b._id}`);
                                                            const d = await res.json();
                                                            setDetailModal({ open: true, booking: d.booking || b });
                                                        } catch (err) {
                                                            setDetailModal({ open: true, booking: b });
                                                        }
                                                    }}
                                                    className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => setEditModal({ open: true, booking: b })}
                                                    className="text-[9px] uppercase tracking-widest text-[#C5A059] hover:text-[#FDFBF7]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteBooking(b._id)}
                                                    className="text-[9px] uppercase tracking-widest text-red-500/30 hover:text-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* View Detail Modal */}
            {detailModal.open && detailModal.booking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setDetailModal({ open: false, booking: null })}></div>
                    <div className="relative bg-[#060606] border border-white/5 w-full max-w-2xl p-10 shadow-2xl overflow-y-auto max-h-[90vh] font-poppins">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] mb-2">Booking Archive</p>
                                <h2 className="text-3xl font-serif text-[#FDFBF7]">{detailModal.booking.confirmationNumber}</h2>
                            </div>
                            <button onClick={() => setDetailModal({ open: false, booking: null })} className="p-2 text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-quicksand">
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Client Identity</label>
                                    <p className="text-lg font-medium text-[#FDFBF7]">{detailModal.booking.clientName}</p>
                                    <p className="text-sm text-gray-400 mt-1">{detailModal.booking.clientEmail}</p>
                                    <p className="text-sm text-gray-400">{detailModal.booking.clientPhone}</p>
                                </div>
                                <div>
                                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Service Brief</label>
                                    <p className="text-sm uppercase tracking-widest text-[#FDFBF7] font-bold">{detailModal.booking.service}</p>
                                    <div className="mt-4 p-4 bg-[#0A0A0A] border border-white/5 rounded-sm">
                                        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Preferred Hair Color(s)</p>
                                        <p className="text-xs text-[#C5A059] italic uppercase">{detailModal.booking.hairColor || 'None'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Schedule</label>
                                    <p className="text-sm text-[#FDFBF7] font-bold uppercase tracking-widest">
                                        {new Date(detailModal.booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-lg text-[#C5A059] font-serif mt-1">{detailModal.booking.time}</p>
                                </div>
                                <div>
                                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-2">Investment Detail</label>
                                    <p className="text-2xl text-[#FDFBF7] font-serif">${detailModal.booking.price}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                                        Status: <span className={statusStyle(detailModal.booking.status)}>{detailModal.booking.status.toUpperCase()}</span>
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                        Payment: {detailModal.booking.paymentStatus?.toUpperCase() || 'UNKNOWN'} via {detailModal.booking.paymentMethod?.toUpperCase() || 'PENDING'}
                                    </p>
                                </div>
                            </div>
                        </div>

                                                <div className="mt-12 pt-12 border-t border-white/5 font-quicksand">
                                                    <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-6">Additional Selections (Add Extras)</label>
                                                    {detailModal.booking.addons && detailModal.booking.addons.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {detailModal.booking.addons.map((addon: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center p-4 bg-[#0A0A0A] border border-white/5 rounded-sm">
                                                                    <span className="text-[10px] uppercase tracking-widest text-[#FDFBF7] font-bold">{addon.name}</span>
                                                                    {addon.price > 0 && <span className="text-[10px] text-[#C5A059] font-serif">${addon.price}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">No extras selected.</p>
                                                    )}
                                                </div>

                        {detailModal.booking.notes && (
                            <div className="mt-12 pt-12 border-t border-white/5 font-quicksand">
                                <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-4">Client Brief / Notes</label>
                                <p className="text-xs text-gray-400 leading-relaxed bg-[#0A0A0A] p-6 italic border-l-2 border-[#C5A059]/20">{detailModal.booking.notes}</p>
                            </div>
                        )}

                        <div className="mt-12 flex gap-4 pt-4">
                            <button
                                onClick={() => {
                                    setEditModal({ open: true, booking: detailModal.booking });
                                    setDetailModal({ open: false, booking: null });
                                }}
                                className="flex-1 bg-[#C5A059] py-4 text-[9px] uppercase tracking-[0.3em] text-black font-bold hover:bg-[#DFBE82] transition-colors"
                            >
                                Modify Settings
                            </button>
                            <button
                                onClick={() => setDetailModal({ open: false, booking: null })}
                                className="flex-1 border border-white/10 py-4 text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors"
                            >
                                Close Archives
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.open && editModal.booking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setEditModal({ open: false, booking: null })}></div>
                    <div className="relative bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-lg p-8 transform transition-all overflow-y-auto max-h-[90vh] font-poppins">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[8px] uppercase tracking-[0.4em] text-[#C5A059] mb-1">Modifier</p>
                                <h2 className="text-2xl font-serif text-[#FDFBF7]">Edit Reservation</h2>
                            </div>
                            <button onClick={() => setEditModal({ open: false, booking: null })} className="text-gray-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const updates: any = Object.fromEntries(formData.entries());

                            if (updates.reference) {
                                updates.confirmationNumber = updates.reference;
                                delete updates.reference;
                            }

                            if (updates.addonsText !== undefined) {
                                updates.addons = updates.addonsText.split('\n')
                                    .filter((line: string) => line.trim())
                                    .map((line: string) => ({
                                        name: line.trim(),
                                        price: 0
                                    }));
                                delete updates.addonsText;
                            }

                            setUpdating(editModal.booking!._id);
                            await fetch(`/api/admin/bookings/${editModal.booking!._id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updates),
                            });
                            await fetchBookings();
                            setEditModal({ open: false, booking: null });
                            setUpdating(null);
                        }} className="space-y-6 text-left font-quicksand">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Reference</label>
                                    <input name="reference" defaultValue={editModal.booking.confirmationNumber} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-[#C5A059] font-mono focus:outline-none focus:border-[#C5A059]" />
                                </div>
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Client Name</label>
                                    <input name="clientName" defaultValue={editModal.booking.clientName} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Email</label>
                                    <input name="clientEmail" defaultValue={editModal.booking.clientEmail} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Phone</label>
                                    <input name="clientPhone" defaultValue={editModal.booking.clientPhone} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Price ($)</label>
                                    <input name="price" type="number" defaultValue={editModal.booking.price} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Service</label>
                                    <input name="service" defaultValue={editModal.booking.service} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Preferred Hair Color(s)</label>
                                    <input name="hairColor" defaultValue={editModal.booking.hairColor} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Add Extra (One per line)</label>
                                <textarea
                                    name="addonsText"
                                    defaultValue={editModal.booking.addons?.map(a => a.name).join('\n')}
                                    rows={3}
                                    placeholder="e.g. Wash & Blow Dry&#10;Deep Conditioning"
                                    className="w-full bg-[#0A0A0A] border border-[#222] p-3 text-xs text-[#C5A059] focus:outline-none focus:border-[#C5A059] resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Date</label>
                                    <input name="date" type="date" defaultValue={new Date(editModal.booking.date).toISOString().split('T')[0]} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                                <div>
                                    <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Time</label>
                                    <input name="time" defaultValue={editModal.booking.time} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#141414] mt-8">
                                <div className="grid grid-cols-2 gap-6 mb-8 font-poppins">
                                    <div>
                                        <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Payment Status</label>
                                        <select name="paymentStatus" defaultValue={editModal.booking.paymentStatus || 'pending'} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-[#C5A059] focus:outline-none focus:border-[#C5A059] appearance-none">
                                            {['pending', 'completed', 'failed', 'refunded'].map(s => (
                                                <option key={s} value={s} className="bg-[#111]">{s.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Payment Method</label>
                                        <select name="paymentMethod" defaultValue={(editModal.booking as any).paymentMethod || 'pending'} className="w-full bg-transparent border-b border-[#222] py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] appearance-none">
                                            {['pending', 'stripe', 'paypal', 'mobile-money', 'manual'].map(m => (
                                                <option key={m} value={m} className="bg-[#111]">{m.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                                    <div className="text-[9px] text-gray-500 italic">
                                        * Manual updates bypass gateway reconciliation.
                                    </div>
                                    {editModal.booking.paymentStatus === 'completed' && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!confirm('Process full refund? This will cancel the booking.')) return;
                                                const res = await fetch(`/api/admin/bookings/${editModal.booking!._id}/refund`, { method: 'POST' });
                                                if (res.ok) {
                                                    alert('Refund processed.');
                                                    fetchBookings();
                                                    setEditModal({ open: false, booking: null });
                                                } else {
                                                    const d = await res.json();
                                                    alert(`Refund failed: ${d.error}`);
                                                }
                                            }}
                                            className="text-[9px] uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors border border-red-500/20 px-4 py-2"
                                        >
                                            Refund Investment
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setEditModal({ open: false, booking: null })} className="flex-1 border border-[#222] py-3 text-[9px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 bg-[#C5A059] py-3 text-[9px] uppercase tracking-widest text-black font-bold hover:bg-[#DFBE82] transition-colors">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
