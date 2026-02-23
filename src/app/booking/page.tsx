'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';

type ServiceSize = { id: string; name: string; price: number; duration: number };
type StyleCategory = { id: string; name: string; description: string; tag: string; sizes: ServiceSize[] };
type Addon = { _id: string; name: string; description: string; price: number; duration: number; linkedCategories: string[]; linkedSizes: string[] };

const styleCategories: StyleCategory[] = [
  {
    id: 'box-braids', name: 'Premium Box Braids', tag: 'Most popular',
    description: 'Classic tension-free structural partings with a clean squared finish.',
    sizes: [
      { id: 'bb-s', name: 'Small', price: 250, duration: 360 },
      { id: 'bb-m', name: 'Medium', price: 200, duration: 240 },
      { id: 'bb-l', name: 'Large', price: 150, duration: 180 },
    ],
  },
  {
    id: 'knotless-braids', name: 'Knotless Braids', tag: 'Signature',
    description: 'Seamless, painless roots — no tension, no bulge, invisible finish.',
    sizes: [
      { id: 'kb-s', name: 'Small', price: 300, duration: 420 },
      { id: 'kb-m', name: 'Medium', price: 250, duration: 300 },
      { id: 'kb-l', name: 'Large', price: 200, duration: 240 },
    ],
  },
  {
    id: 'cornrows', name: 'Signature Cornrows', tag: 'Editorial',
    description: 'Architectural straight-backs or custom braided patterns by appointment.',
    sizes: [
      { id: 'cr-s', name: 'Small / Detailed Pattern', price: 180, duration: 240 },
      { id: 'cr-m', name: 'Medium / 6-8 Rows', price: 120, duration: 120 },
      { id: 'cr-l', name: 'Large / 2-4 Feed-ins', price: 80, duration: 90 },
    ],
  },
];

const AVAILABLE_TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:30 PM', '4:30 PM'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type Step = 'category' | 'size' | 'addons' | 'datetime' | 'info' | 'confirmation';

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getDays() {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) days.push(d); // skip Sundays
  }
  return days;
}

const STEPS: Record<Step, { n: string; label: string }> = {
  category: { n: '01', label: 'Select Style' },
  size: { n: '02', label: 'Select Size' },
  addons: { n: '03', label: 'Add Extra' },
  datetime: { n: '04', label: 'Date & Time' },
  info: { n: '05', label: 'Your Details' },
  confirmation: { n: '06', label: 'Confirmed' },
};

export default function BookingPage() {
  const [step, setStep] = useState<Step>('category');
  const [categories, setCategories] = useState<StyleCategory[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<StyleCategory | null>(null);
  const [selectedSize, setSelectedSize] = useState<ServiceSize | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '', hairColor: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/siteSettings').then(r => r.json()),
      fetch('/api/admin/addons').then(r => r.json())
    ])
      .then(([settingsData, addonsData]) => {
        const dbServices = settingsData.settings?.services;
        if (dbServices && dbServices.length > 0) {
          setCategories(dbServices.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            tag: 'Classic',
            sizes: s.sizes.map((sz: any) => ({
              id: sz.id,
              name: sz.size,
              price: sz.price,
              duration: sz.duration
            }))
          })));
        } else {
          setCategories(styleCategories);
        }
        setAddons(addonsData.addons || []);
      })
      .catch(() => {
        setCategories(styleCategories);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAddonPrice = selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const totalPrice = (selectedSize?.price || 0) + totalAddonPrice;
  const totalDuration = (selectedSize?.duration || 0) + selectedAddons.reduce((acc, a) => acc + a.duration, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSize || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: `${formData.firstName} ${formData.lastName}`.trim(),
          clientEmail: formData.email,
          clientPhone: formData.phone,
          service: `${selectedCategory.name} — ${selectedSize.name}`,
          serviceId: selectedSize.id,
          addons: selectedAddons.map(a => ({ id: a._id, name: a.name, price: a.price })),
          date: selectedDate.toISOString(),
          time: selectedTime,
          duration: totalDuration,
          price: totalPrice,
          hairColor: formData.hairColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setConfirmationNumber(data.confirmationNumber || '');

      // Redirect to Stripe checkout
      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: data.booking._id,
          price: 30, // Charging the $30 deposit
          clientEmail: formData.email,
          serviceName: `${selectedCategory.name} (${selectedSize.name})`,
        }),
      });
      const stripeData = await stripeRes.json();
      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        setStep('confirmation');
      }
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTicket = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('serif', 'bold');
    doc.setFontSize(24);
    doc.text('SOLANGE', 105, 20, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(197, 160, 89);
    doc.text('SIGNATURE HAIR — LA MAISON DE BEAUTÉ', 105, 30, { align: 'center' });

    // Details Block
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('OFFICIAL RESERVATION TICKET', 20, 55);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);

    doc.setFontSize(9);
    doc.text(`REFERENCE: ${confirmationNumber}`, 20, 70);
    doc.text(`CLIENT: ${formData.firstName} ${formData.lastName}`, 20, 80);
    doc.text(`SERVICE: ${selectedCategory?.name} (${selectedSize?.name})`, 20, 90);
    doc.text(`DATE: ${selectedDate?.toLocaleDateString()} at ${selectedTime}`, 20, 100);
    doc.text(`TOTAL INVESTMENT: $${totalPrice}`, 20, 110);
    doc.text(`HAIR COLOR: ${formData.hairColor || 'No specific selection'}`, 20, 120);

    // Extras
    if (selectedAddons.length > 0) {
      doc.text('EXTRAS INCLUDED:', 20, 135);
      selectedAddons.forEach((a, i) => {
        doc.text(`• ${a.name}`, 25, 142 + (i * 5));
      });
    }

    // Studio Info
    const startY = selectedAddons.length > 0 ? 160 + (selectedAddons.length * 5) : 140;
    doc.setFillColor(250, 250, 250);
    doc.rect(20, startY, 170, 40, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text('LA MAISON LOCATION:', 30, startY + 10);
    doc.setFontSize(8);
    doc.text('6495 New Hampshire Ave, Hyattsville, MD', 30, startY + 18);
    doc.text('Contact: +1 301 454 9435', 30, startY + 24);
    doc.text('Email: Experience@solange.hair', 30, startY + 30);

    // Policies
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('* $30 deposit is required to secure session. Non-refundable.', 20, 280);
    doc.text('* Any complaints must be reported within 3 days maximum.', 20, 285);

    doc.save(`Solange-Ticket-${confirmationNumber}.pdf`);
  };

  const handleCategorySelect = (cat: StyleCategory) => {
    setSelectedCategory(cat);
    if (cat.sizes.length === 1) {
      setSelectedSize(cat.sizes[0]);
      setStep('addons');
    }
    else { setSelectedSize(null); setStep('size'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSizeSelect = (size: ServiceSize) => {
    setSelectedSize(size);
    setStep('addons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a._id === addon._id)
        ? prev.filter(a => a._id !== addon._id)
        : [...prev, addon]
    );
  };

  const availableAddons = addons.filter(a => {
    if (!selectedCategory || !selectedSize) return false;
    // If no specific links are defined, show to all
    if (a.linkedCategories.length === 0 && a.linkedSizes.length === 0) return true;
    return a.linkedCategories.includes(selectedCategory.id) || a.linkedSizes.includes(selectedSize.id);
  });

  const days = getDays();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-[9px] uppercase tracking-widest text-[#404040] animate-pulse font-serif">
        Opening Ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#FDFBF7] font-sans pt-24 lg:pt-32 pb-20">
      <div className="max-w-[1100px] mx-auto px-5 lg:px-10">

        {/* ─── Page Title ─── */}
        <div className="mb-12 border-b border-[#141414] pb-8">
          <span className="text-[9px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3">Concierge Booking</span>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-none">
            Reserve <span className="italic font-light text-[#C5A059]">a Session.</span>
          </h1>
        </div>

        {/* ─── Step Indicator ─── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10">
          {(Object.entries(STEPS) as [Step, { n: string; label: string }][]).map(([key, val], i, arr) => {
            const isDone = Object.keys(STEPS).indexOf(step) > i;
            const isActive = key === step;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 ${isActive ? 'opacity-100' : isDone ? 'opacity-60' : 'opacity-20'}`}>
                  <span className={`text-[8px] font-mono tabular-nums ${isActive ? 'text-[#C5A059]' : 'text-[#FDFBF7]'}`}>{val.n}</span>
                  <span className={`text-[9px] uppercase tracking-[0.2em] hidden sm:block ${isActive ? 'text-[#C5A059]' : 'text-[#FDFBF7]'}`}>{val.label}</span>
                </div>
                {i < arr.length - 1 && <span className="text-[#222] text-[10px]">—</span>}
              </div>
            );
          })}
        </div>

        {/* ─── Main Grid ─── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-32">

            {/* Brand mark */}
            <div className="border border-[#141414] p-6 mb-6 flex flex-col items-center text-center">
              <span className="text-5xl font-serif text-[#C5A059] opacity-30 block mb-2">S.</span>
              <span className="text-base font-serif text-[#FDFBF7]">Solange</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#8A8070] mt-1">La Maison de Beauté</span>
            </div>

            {/* Appointment Summary */}
            <div className="border border-[#141414] bg-[#060606] p-5 space-y-4">
              <span className="text-[8px] uppercase tracking-[0.35em] text-[#C5A059] block">Itinerary</span>

              {selectedCategory ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-serif text-[#FDFBF7]">{selectedCategory.name}</p>
                    {selectedSize ? (
                      <div className="flex justify-between items-baseline mt-2 border-b border-[#141414] pb-3">
                        <span className="text-[9px] uppercase tracking-widest text-[#C8C0B0]">{selectedSize.name} · {formatDuration(selectedSize.duration)}</span>
                        <span className="text-sm text-[#C5A059] tabular-nums">${selectedSize.price}</span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-[#5A5248] mt-1 italic">Awaiting size selection</p>
                    )}
                  </div>

                  {selectedAddons.length > 0 && (
                    <div className="space-y-1 border-b border-[#141414] pb-3">
                      {selectedAddons.map(a => (
                        <div key={a._id} className="flex justify-between text-[9px] uppercase tracking-widest">
                          <span className="text-[#8A8070]">{a.name}</span>
                          <span className="text-[#C5A059]">+${a.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDate ? (
                    <div className="pt-1">
                      <p className="text-xs text-[#FDFBF7]">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{selectedTime || 'Awaiting time'}</p>
                    </div>
                  ) : (
                    <p className="text-[9px] text-[#5A5248] italic">Awaiting schedule</p>
                  )}

                  {selectedSize && (
                    <div className="pt-2 flex justify-between items-center border-t border-[#141414]">
                      <span className="text-[8px] uppercase tracking-widest text-[#404040]">Investment</span>
                      <span className="text-base font-serif text-[#FDFBF7]">${totalPrice}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[9px] text-[#5A5248] italic">No selection yet</p>
              )}
            </div>

            {/* Policy note */}
            <p className="text-[9px] text-[#5A5248] leading-relaxed mt-4 px-1">
              By appointment only. 24-hour cancellation policy applies. A confirmation will be dispatched upon booking.
            </p>
          </aside>

          {/* Main Wizard Content */}
          <div className="flex-1 min-h-[480px]">

            {/* ── Step 1: Choose Style ── */}
            {step === 'category' && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-[#8A8070] mb-6">Choose your base style</p>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat)}
                      className="w-full group border border-[#141414] bg-[#060606] hover:border-[#C5A059]/40 hover:bg-[#080808] transition-all p-5 text-left flex items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-serif text-[#FDFBF7] text-base group-hover:text-[#C5A059] transition-colors">{cat.name}</h3>
                          {cat.tag && <span className="text-[7px] uppercase tracking-widest text-[#C5A059] border border-[#C5A059]/30 px-2 py-0.5">{cat.tag}</span>}
                        </div>
                        <p className="text-xs text-[#8A8070] leading-relaxed">{cat.description}</p>
                        <p className="text-[9px] text-[#C5A059] mt-2 uppercase tracking-widest">
                          From ${cat.sizes.length > 0 ? Math.min(...cat.sizes.map(s => s.price)) : 0}
                        </p>
                      </div>
                      <span className="text-[#404040] group-hover:text-[#C5A059] text-lg transition-colors shrink-0">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Choose Size ── */}
            {step === 'size' && selectedCategory && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => { setStep('category'); setSelectedCategory(null); }}
                    className="text-[9px] uppercase tracking-widest text-[#8A8070] hover:text-[#C5A059] transition-colors">
                    ← Styles
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-[#8A8070]">Select variation</p>
                </div>
                <p className="text-sm font-serif text-[#FDFBF7] mb-6 border-b border-[#141414] pb-4">{selectedCategory.name}</p>
                <div className="space-y-2">
                  {selectedCategory.sizes.map(size => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeSelect(size)}
                      className="w-full group border border-[#141414] bg-[#060606] hover:border-[#C5A059]/40 transition-all p-5 flex items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-serif text-[#FDFBF7] group-hover:text-[#C5A059] transition-colors mb-1">{size.name}</p>
                        <p className="text-[9px] uppercase tracking-widest text-[#8A8070]">{formatDuration(size.duration)} session</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-serif text-[#C5A059]">${size.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Addons ── */}
            {step === 'addons' && selectedCategory && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => { setStep('size'); setSelectedAddons([]); }}
                    className="text-[9px] uppercase tracking-widest text-[#8A8070] hover:text-[#C5A059] transition-colors">
                    ← Variation
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-[#8A8070]">Enhance your style</p>
                </div>

                <div className="space-y-3">
                  {availableAddons.length > 0 ? (
                    availableAddons.map(a => {
                      const isSelected = selectedAddons.find(x => x._id === a._id);
                      return (
                        <button
                          key={a._id}
                          onClick={() => toggleAddon(a)}
                          className={`w-full group border p-5 flex items-center justify-between transition-all ${isSelected ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-[#141414] bg-[#060606] hover:border-[#333]'}`}
                        >
                          <div className="text-left flex-1">
                            <p className={`text-sm font-serif ${isSelected ? 'text-[#C5A059]' : 'text-[#FDFBF7]'}`}>{a.name}</p>
                            <p className="text-[10px] text-[#8A8070] leading-relaxed mt-1">{a.description}</p>
                            <p className="text-[8px] uppercase tracking-widest text-[#5A5248] mt-2">+{a.duration} mins duration</p>
                          </div>
                          <div className="text-right ml-6">
                            <span className={`text-sm font-serif ${isSelected ? 'text-[#C5A059]' : 'text-[#8A8070]'}`}>+${a.price}</span>
                            <div className={`w-4 h-4 border mx-auto mt-3 flex items-center justify-center transition-colors ${isSelected ? 'border-[#C5A059] bg-[#C5A059]' : 'border-[#222]'}`}>
                              {isSelected && <span className="text-[8px] text-[#0A0A0A]">✓</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 border border-dashed border-[#141414]">
                      <p className="text-[10px] uppercase tracking-widest text-[#404040]">No extras available for this selection</p>
                    </div>
                  )}

                  <button
                    onClick={() => setStep('datetime')}
                    className="w-full mt-6 bg-[#C5A059] text-[#080808] py-4 text-[9px] uppercase tracking-[0.35em] hover:bg-[#DFBE82] transition-colors font-semibold shadow-xl"
                  >
                    Continue to Schedule →
                  </button>
                  <button
                    onClick={() => { setSelectedAddons([]); setStep('datetime'); }}
                    className="w-full py-2 text-[8px] uppercase tracking-[0.2em] text-[#404040] hover:text-[#8A8070] transition-colors"
                  >
                    Skip addons
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Date & Time ── */}
            {step === 'datetime' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => { setStep('addons'); setSelectedDate(null); setSelectedTime(''); }}
                    className="text-[9px] uppercase tracking-widest text-[#8A8070] hover:text-[#C5A059] transition-colors">
                    ← Addon
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-[#8A8070]">Pick a date & time</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="border border-[#141414] bg-[#060606] p-5">
                    <div className="grid grid-cols-7 gap-1 text-center mb-3">
                      {DAY_LABELS.map(d => (
                        <div key={d} className="text-[8px] uppercase tracking-widest text-[#C5A059] pb-2 border-b border-[#141414]">{d}</div>
                      ))}
                    </div>
                    {/* Offset placeholder for correct starting day */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={i} />
                      ))}
                      {days.map((date, i) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const isToday = new Date().toDateString() === date.toDateString();
                        return (
                          <button key={i} onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                            className={`aspect-square flex items-center justify-center text-xs transition-all ${isSelected
                              ? 'bg-[#C5A059] text-[#080808] font-semibold'
                              : isToday
                                ? 'border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10'
                                : 'text-[#C8C0B0] hover:text-[#FDFBF7] hover:bg-white/5'
                              }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="border border-[#141414] bg-[#060606] p-5">
                    {selectedDate ? (
                      <>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] mb-4">
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <div className="space-y-2">
                          {AVAILABLE_TIMES.map(time => (
                            <button key={time} onClick={() => setSelectedTime(time)}
                              className={`w-full py-3 text-[10px] tracking-widest uppercase transition-all border ${selectedTime === time
                                ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]'
                                : 'border-[#1A1A1A] text-[#C8C0B0] hover:border-[#333] hover:text-[#FDFBF7]'
                                }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                        {selectedTime && (
                          <button onClick={() => setStep('info')}
                            className="mt-5 w-full bg-[#C5A059] text-[#080808] py-3 text-[9px] uppercase tracking-[0.3em] hover:bg-[#DFBE82] transition-colors font-semibold">
                            Continue →
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-center">
                        <span className="text-2xl font-serif text-[#1A1A1A]">◇</span>
                        <p className="text-[9px] uppercase tracking-widest text-[#5A5248]">Select a date first</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Client Details ── */}
            {step === 'info' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setStep('datetime')}
                    className="text-[9px] uppercase tracking-widest text-[#8A8070] hover:text-[#C5A059] transition-colors">
                    ← Calendar
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-[#8A8070]">Your details</p>
                </div>

                <div className="border border-[#141414] bg-[#060606] p-6 lg:p-8">
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'First Name', key: 'firstName', type: 'text' },
                        { label: 'Last Name', key: 'lastName', type: 'text' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-[8px] uppercase tracking-[0.25em] text-[#8A8070] mb-2">{f.label}</label>
                          <input
                            type={f.type} required
                            value={formData[f.key as keyof typeof formData]}
                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                            className="w-full bg-transparent border-b border-[#222] py-2.5 text-sm text-[#FDFBF7] focus:border-[#C5A059] focus:outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    {[
                      { label: 'Phone Number', key: 'phone', type: 'tel' },
                      { label: 'Email Address', key: 'email', type: 'email' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[8px] uppercase tracking-[0.25em] text-[#8A8070] mb-2">{f.label}</label>
                        <input
                          type={f.type} required
                          value={formData[f.key as keyof typeof formData]}
                          onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                          className="w-full bg-transparent border-b border-[#222] py-2.5 text-sm text-[#FDFBF7] focus:border-[#C5A059] focus:outline-none transition-colors"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[8px] uppercase tracking-[0.25em] text-[#8A8070] mb-2">Preferred Hair Color(s)</label>
                      <input
                        type="text"
                        value={formData.hairColor}
                        onChange={e => setFormData({ ...formData, hairColor: e.target.value })}
                        placeholder="e.g., Jet Black #1, Honey Blonde #27..."
                        className="w-full bg-transparent border-b border-[#222] py-2.5 text-sm text-[#FDFBF7] focus:border-[#C5A059] focus:outline-none transition-colors"
                      />
                      <p className="text-[9px] text-[#5A5248] mt-2 italic">Specify multiple colors if needed for custom blends.</p>
                    </div>

                    {/* Order summary before submit */}
                    {selectedSize && selectedDate && (
                      <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-4 space-y-2">
                        <p className="text-[8px] uppercase tracking-[0.3em] text-[#C5A059] mb-3">Booking Summary</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#C8C0B0]">{selectedCategory?.name}</span>
                          <span className="text-[#FDFBF7]">{selectedSize.name}</span>
                        </div>

                        {selectedAddons.length > 0 && (
                          <div className="pt-1">
                            {selectedAddons.map(a => (
                              <div key={a._id} className="flex justify-between text-[10px] text-[#8A8070]">
                                <span>+ {a.name}</span>
                                <span>${a.price}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between text-xs pt-1">
                          <span className="text-[#C8C0B0]">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-[#FDFBF7]">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-[#1A1A1A] pt-2 mt-2">
                          <span className="text-[#C8C0B0]">Total Investment</span>
                          <span className="text-[#C5A059] font-serif text-base">${totalPrice}</span>
                        </div>
                      </div>
                    )}

                    {submitError && (
                      <p className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 px-4 py-3">
                        {submitError}
                      </p>
                    )}

                    <button type="submit" disabled={submitting}
                      className="w-full bg-[#C5A059] text-[#080808] py-4 text-[9px] uppercase tracking-[0.35em] hover:bg-[#DFBE82] transition-colors font-semibold disabled:opacity-60 disabled:cursor-wait">
                      {submitting ? 'Securing Reservation...' : 'Finalize Reservation'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── Step 5: Confirmation ── */}
            {step === 'confirmation' && (
              <div className="border border-[#C5A059]/20 bg-[#060606] p-12 lg:p-16 text-center">
                <div className="w-16 h-16 border border-[#C5A059]/40 flex items-center justify-center mx-auto mb-8">
                  <span className="text-2xl font-serif text-[#C5A059]">S.</span>
                </div>
                <span className="text-[8px] uppercase tracking-[0.4em] text-[#C5A059] block mb-4">Confirmed</span>
                <h2 className="text-3xl font-serif text-[#FDFBF7] mb-4 leading-tight">
                  Reservation<br />Secured.
                </h2>
                <p className="text-sm text-[#C8C0B0] leading-relaxed max-w-sm mx-auto mb-2">
                  Thank you, <span className="text-[#FDFBF7]">{formData.firstName}</span>. Your appointment for <span className="text-[#FDFBF7]">{selectedCategory?.name} ({selectedSize?.name})</span> has been entered into the ledger.
                </p>

                {selectedAddons.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-[#8A8070] mb-2">Including Extras:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {selectedAddons.map(a => (
                        <span key={a._id} className="text-[9px] px-2 py-1 bg-[#111] border border-[#222] text-[#C8C0B0]">
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {confirmationNumber && (
                  <div className="inline-block border border-[#C5A059]/30 bg-[#C5A059]/5 px-5 py-2 my-4">
                    <p className="text-[7px] uppercase tracking-[0.3em] text-[#8A8070] mb-1">Confirmation No.</p>
                    <p className="text-sm font-mono text-[#C5A059] tracking-wider">{confirmationNumber}</p>
                  </div>
                )}
                <p className="text-xs text-[#8A8070] mb-10">A formal confirmation will be dispatched to {formData.email}.</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleDownloadTicket}
                    className="bg-[#C5A059] text-black py-3 px-6 text-[9px] uppercase tracking-widest font-semibold hover:bg-[#DFBE82] transition-all flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download Ticket
                  </button>
                  <button
                    onClick={() => { setStep('category'); setSelectedCategory(null); setSelectedSize(null); setSelectedDate(null); setSelectedTime(''); setFormData({ firstName: '', lastName: '', phone: '', email: '', hairColor: '' }); setConfirmationNumber(''); }}
                    className="border border-[#222] text-[#C8C0B0] hover:border-[#C5A059]/40 hover:text-[#FDFBF7] py-3 px-6 text-[9px] uppercase tracking-widest transition-all">
                    Book Another
                  </button>
                  <Link href="/" className="bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/20 py-3 px-6 text-[9px] uppercase tracking-widest transition-all">
                    Return Home
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
