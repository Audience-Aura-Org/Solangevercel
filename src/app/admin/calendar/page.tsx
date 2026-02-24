'use client';

import { useEffect, useState, useMemo } from 'react';

type Booking = {
    _id: string;
    clientName: string;
    service: string;
    date: string;
    time: string;
    status: 'confirmed' | 'completed' | 'cancelled';
    price: number;
    duration: number;
};

const STATUS_COLOR: Record<string, string> = {
    confirmed: 'bg-[#C5A059]/15 border-l-2 border-[#C5A059] text-[#C5A059]',
    completed: 'bg-emerald-400/10 border-l-2 border-emerald-400 text-emerald-400',
    cancelled: 'bg-red-500/10 border-l-2 border-red-500/70 text-red-500/70',
};

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9am – 6pm

function timeToDecimal(t: string): number {
    const lower = t.toLowerCase();
    const isPM = lower.includes('pm');
    const isAM = lower.includes('am');
    const clean = lower.replace('am', '').replace('pm', '').trim();
    const [h, m = '0'] = clean.split(':').map(Number);
    let hours = h;
    if (isPM && h !== 12) hours += 12;
    if (isAM && h === 12) hours = 0;
    return hours + (m as number) / 60;
}

// Returns abbreviated weekday/day labels for the week
function getWeekDays(startDate: Date) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });
}

function startOfWeek(d: Date) {
    const date = new Date(d);
    const day = date.getDay(); // 0=Sun
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCalendarPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [view, setView] = useState<'week' | 'list'>('week');

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings?status=all');
            const json = await res.json();
            if (json.bookings) setBookings(json.bookings);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const id = setInterval(fetchBookings, 15000);
        return () => clearInterval(id);
    }, []);

    const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

    // Group bookings by ISO date string
    const byDate = useMemo(() => {
        const map: Record<string, Booking[]> = {};
        bookings.forEach(b => {
            const key = new Date(b.date).toISOString().slice(0, 10);
            if (!map[key]) map[key] = [];
            map[key].push(b);
        });
        return map;
    }, [bookings]);

    const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
    const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
    const goToday = () => setWeekStart(startOfWeek(new Date()));

    const todayStr = new Date().toISOString().slice(0, 10);

    return (
        <div className="space-y-8">

            {/* ─── Header ─── */}
            <div className="border-b border-[#141414] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#404040] mb-3">Schedule</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#FDFBF7] tracking-tight leading-none">Calendar</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex border border-[#222]">
                        {(['week', 'list'] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] transition-all ${view === v ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-[#404040] hover:text-[#808080]'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Nav */}
                    <div className="flex items-center gap-2">
                        <button onClick={prevWeek} className="w-8 h-8 border border-[#222] flex items-center justify-center text-[#404040] hover:text-[#FDFBF7] hover:border-[#444] transition-all text-xs">
                            ‹
                        </button>
                        <button onClick={goToday} className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-[#404040] border border-[#222] hover:text-[#C5A059] hover:border-[#C5A059]/30 transition-all">
                            Today
                        </button>
                        <button onClick={nextWeek} className="w-8 h-8 border border-[#222] flex items-center justify-center text-[#404040] hover:text-[#FDFBF7] hover:border-[#444] transition-all text-xs">
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {/* Week Label */}
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#404040]">
                {weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {loading ? (
                <div className="py-20 text-center text-[9px] uppercase tracking-widest text-[#404040] animate-pulse">Loading schedule...</div>
            ) : view === 'week' ? (

                /* ─── WEEK GRID VIEW ─── */
                <div className="border border-[#141414] bg-[#060606] overflow-x-auto max-h-[calc(100vh-200px)] md:max-h-full">
                    <div className="min-w-[320px] sm:min-w-[700px]">

                        {/* Day Header Row */}
                        <div className="grid grid-cols-8 border-b border-[#141414]">
                            <div className="border-r border-[#141414] px-2 sm:px-3 py-2 sm:py-4" />
                            {weekDays.map((d, i) => {
                                const ds = d.toISOString().slice(0, 10);
                                const isToday = ds === todayStr;
                                const count = byDate[ds]?.length || 0;
                                return (
                                    <div key={i} className={`px-2 sm:px-3 py-2 sm:py-4 text-center border-r border-[#141414] last:border-0 transition-colors ${isToday ? 'bg-[#C5A059]/25 border-[#C5A059]/40' : ''}`}>
                                        <p className={`text-[7px] sm:text-[8px] uppercase tracking-[0.2em] mb-1 ${isToday ? 'text-[#FDFBF7]' : 'text-[#404040]'}`}>
                                            {DAY_LABELS[d.getDay()]}
                                        </p>
                                        <p className={`text-sm sm:text-lg font-serif font-bold ${isToday ? 'text-[#FDFBF7]' : 'text-[#FDFBF7]'}`}>
                                            {d.getDate()}
                                        </p>
                                        {count > 0 && (
                                            <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Time Rows */}
                        {HOURS.map(hour => (
                            <div key={hour} className="grid grid-cols-8 border-b border-[#0E0E0E] last:border-0 min-h-[48px] sm:min-h-[64px]">
                                {/* Hour Label */}
                                <div className="border-r border-[#141414] px-2 sm:px-3 py-1 sm:py-2 flex items-start">
                                    <span className="text-[7px] sm:text-[8px] text-[#303030] tabular-nums">
                                        {hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                                    </span>
                                </div>

                                {/* Day Cells */}
                                {weekDays.map((day, di) => {
                                    const ds = day.toISOString().slice(0, 10);
                                    const isToday = ds === todayStr;
                                    const dayBookings = (byDate[ds] || []).filter(b => {
                                        const t = timeToDecimal(b.time);
                                        return t >= hour && t < hour + 1;
                                    });

                                    return (
                                        <div key={di} className={`relative border-r border-[#0E0E0E] last:border-0 px-1 sm:px-1.5 py-1 sm:py-1.5 space-y-1 transition-colors ${isToday ? 'bg-[#C5A059]/15' : ''}`}>
                                            {dayBookings.map(b => (
                                                <div
                                                    key={b._id}
                                                    className={`px-2 py-1.5 text-[8px] leading-snug ${STATUS_COLOR[b.status] || 'bg-[#111] text-[#606060]'}`}
                                                >
                                                    <p className="font-medium truncate">{b.clientName}</p>
                                                    <p className="opacity-70 truncate">{b.time} · {b.service}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

            ) : (

                /* ─── LIST VIEW ─── */
                <div className="space-y-4">
                    {weekDays.map(day => {
                        const ds = day.toISOString().slice(0, 10);
                        const isToday = ds === todayStr;
                        const dayBookings = (byDate[ds] || []).sort((a, b) => timeToDecimal(a.time) - timeToDecimal(b.time));
                        return (
                            <div key={ds} className="border border-[#141414] bg-[#060606]">
                                <div className={`px-6 py-3 border-b border-[#141414] flex items-center justify-between ${isToday ? 'bg-[#C5A059]/5' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[8px] uppercase tracking-[0.25em] ${isToday ? 'text-[#C5A059]' : 'text-[#404040]'}`}>
                                            {DAY_LABELS[day.getDay()]}
                                        </span>
                                        <span className={`text-sm font-serif ${isToday ? 'text-[#C5A059]' : 'text-[#FDFBF7]'}`}>
                                            {day.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                        </span>
                                        {isToday && <span className="text-[7px] uppercase tracking-widest text-[#C5A059] px-2 py-0.5 border border-[#C5A059]/30">Today</span>}
                                    </div>
                                    <span className="text-[9px] text-[#404040]">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</span>
                                </div>

                                {dayBookings.length === 0 ? (
                                    <div className="px-6 py-4 text-[9px] text-[#303030] uppercase tracking-widest">No appointments</div>
                                ) : (
                                    <div className="divide-y divide-[#0E0E0E]">
                                        {dayBookings.map(b => (
                                            <div key={b._id} className="flex items-center gap-6 px-6 py-4 hover:bg-[#080808] transition-colors">
                                                <span className="text-[10px] tabular-nums text-[#C5A059] w-16 shrink-0">{b.time}</span>
                                                <span className="text-xs text-[#FDFBF7] flex-1">{b.clientName}</span>
                                                <span className="text-[9px] uppercase tracking-widest text-[#606060]">{b.service}</span>
                                                <span className={`text-[8px] uppercase tracking-widest px-2 py-1 ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                                                <span className="text-[10px] text-[#C5A059] tabular-nums">${b.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
