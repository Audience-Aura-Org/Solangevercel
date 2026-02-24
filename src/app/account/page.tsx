'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Booking = {
    _id: string;
    service: string;
    date: string;
    time: string;
    price: number;
    status: string;
    confirmationNumber: string;
    addons?: Array<{ name: string; price: number }>;
};

type Dispute = {
    _id: string;
    bookingId: string;
    subject: string;
    status: string;
    createdAt: string;
};

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'disputes'>('orders');

    const [disputeModal, setDisputeModal] = useState<{ open: boolean; bookingId: string }>({ open: false, bookingId: '' });
    const [disputeForm, setDisputeForm] = useState({ subject: '', reason: '' });
    const [submittingDispute, setSubmittingDispute] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, bookingsRes, disputesRes] = await Promise.all([
                    fetch('/api/auth/me').then(r => r.json()),
                    fetch('/api/bookings/me').then(r => r.json()),
                    fetch('/api/disputes').then(r => r.json())
                ]);

                if (!meRes.authenticated) {
                    router.push('/login');
                    return;
                }

                setUser(meRes.user);
                setBookings(bookingsRes.bookings || []);
                setDisputes(disputesRes.disputes || []);
            } catch (err) {
                console.error('Failed to fetch account data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleDisputeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingDispute(true);
        try {
            const res = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: disputeModal.bookingId,
                    ...disputeForm
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setDisputes([data.dispute, ...disputes]);
                setDisputeModal({ open: false, bookingId: '' });
                setDisputeForm({ subject: '', reason: '' });
                alert('Dispute submitted successfully.');
            } else {
                alert('Failed to submit dispute.');
            }
        } catch (err) {
            alert('Error submitting dispute.');
        } finally {
            setSubmittingDispute(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-[9px] uppercase tracking-[0.4em] text-accent animate-pulse font-serif">
                    Accessing Archive...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-primary font-sans pt-32 pb-20">
            <div className="max-w-5xl mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="mb-12 border-b border-surface pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[9px] uppercase tracking-[0.4em] text-accent block mb-3">Client Profile</span>
                        <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-none capitalize">
                            {user?.name || 'My Account'}
                        </h1>
                        <p className="text-[10px] text-muted uppercase tracking-widest mt-2">
                            {user?.email}
                            {user?.phone && <span className="mx-2 text-accent/30">/</span>}
                            {user?.phone}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mb-10 border-b border-surface">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-4 text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'orders' ? 'text-accent border-b border-accent' : 'text-muted hover:text-muted'}`}
                    >
                        Booking History
                    </button>
                    <button
                        onClick={() => setActiveTab('disputes')}
                        className={`pb-4 text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'disputes' ? 'text-accent border-b border-accent' : 'text-muted hover:text-muted'}`}
                    >
                        Reflections & Disputes
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {bookings.length === 0 ? (
                            <div className="border border-surface bg-dark p-12 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-muted">No bookings found in your ledger.</p>
                            </div>
                        ) : (
                            bookings.map(booking => (
                                <div key={booking._id} className="border border-surface bg-dark p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-accent transition-colors">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[8px] font-mono text-muted tracking-tighter">{booking.confirmationNumber}</span>
                                            <span className={`text-[7px] uppercase tracking-[0.15em] px-2 py-0.5 border ${booking.status === 'confirmed' ? 'border-accent text-accent' : 'border-surface text-muted'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <h3 className="font-serif text-primary text-lg">{booking.service}</h3>
                                        {booking.addons && booking.addons.length > 0 && (
                                            <p className="text-[9px] text-accent/60 tracking-widest uppercase mt-0.5">
                                                Extras: {booking.addons.map(a => a.name).join(', ')}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                                            {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {booking.time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <span className="text-accent font-serif text-xl">${booking.price}</span>
                                        <div className="flex flex-col gap-2 items-end">
                                            <button
                                                onClick={() => setDisputeModal({ open: true, bookingId: booking._id })}
                                                className="text-[9px] uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors border-b border-transparent hover:border-accent pb-0.5"
                                            >
                                                Raise Issue
                                            </button>
                                            {booking.status !== 'cancelled' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Are you sure you want to request cancellation for this session? Our team will review your request.')) return;
                                                        try {
                                                            const res = await fetch('/api/bookings/cancel-request', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ bookingId: booking._id }),
                                                            });
                                                            if (res.ok) alert('Cancellation request submitted to the Maison team.');
                                                            else alert('Unable to process request at this time.');
                                                        } catch {
                                                            alert('An error occurred.');
                                                        }
                                                    }}
                                                    className="text-[9px] uppercase tracking-[0.2em] text-muted hover:text-red-500/80 transition-colors border-b border-transparent hover:border-red-500/30 pb-0.5"
                                                >
                                                    Request Cancellation
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'disputes' && (
                    <div className="space-y-4">
                        {disputes.length === 0 ? (
                            <div className="border border-surface bg-dark p-12 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-muted">Your reflection board is empty.</p>
                            </div>
                        ) : (
                            disputes.map(dispute => (
                                <div key={dispute._id} className="border border-surface bg-dark p-6 flex justify-between items-center group">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[7px] uppercase tracking-widest px-2 py-0.5 ${dispute.status === 'resolved' ? 'bg-green-500/10 text-green-500/80' :
                                                dispute.status === 'pending' ? 'bg-accent/10 text-accent' : 'text-muted'
                                                }`}>
                                                {dispute.status}
                                            </span>
                                            <span className="text-[8px] text-muted uppercase tracking-widest">
                                                {new Date(dispute.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-serif text-primary">{dispute.subject}</h3>
                                    </div>
                                    <span className="text-[18px] text-muted group-hover:text-accent transition-colors">›</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Dispute Modal */}
            {disputeModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setDisputeModal({ open: false, bookingId: '' })}></div>
                    <div className="relative bg-dark border border-surface w-full max-w-md p-8 md:p-10">
                        <h2 className="text-2xl font-serif text-primary mb-6">Raise an Issue.</h2>
                        <form onSubmit={handleDisputeSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[8px] uppercase tracking-[0.25em] text-muted mb-2">Subject</label>
                                <input
                                    type="text" required
                                    value={disputeForm.subject}
                                    onChange={e => setDisputeForm({ ...disputeForm, subject: e.target.value })}
                                    placeholder="e.g., Scheduling Conflict, Service Issue"
                                    className="w-full bg-transparent border-b border-surface py-2 text-sm text-primary focus:border-accent focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] uppercase tracking-[0.25em] text-muted mb-2">Detailed Reason</label>
                                <textarea
                                    required rows={4}
                                    value={disputeForm.reason}
                                    onChange={e => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                                    className="w-full bg-dark border border-surface p-3 text-sm text-primary focus:border-accent focus:outline-none transition-colors"
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setDisputeModal({ open: false, bookingId: '' })}
                                    className="flex-1 border border-surface text-muted py-3 text-[9px] uppercase tracking-widest hover:text-primary hover:border-surface transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={submittingDispute}
                                    className="flex-1 bg-accent text-dark py-3 text-[9px] uppercase tracking-widest font-semibold hover:bg-accent/80 transition-all disabled:opacity-50"
                                >
                                    {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
