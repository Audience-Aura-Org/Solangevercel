'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { jsPDF } from 'jspdf';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<any | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then(r => r.json())
        .then(d => setBooking(d.booking || null))
        .catch(() => setBooking(null));
    }
  }, [bookingId]);

  const downloadTicket = () => {
    if (!booking) return;
    const doc = new jsPDF();

    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('serif', 'bold');
    doc.setFontSize(24);
    doc.text('SOLANGE', 105, 20, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(197, 160, 89);
    doc.text('SIGNATURE HAIR — LA MAISON DE BEAUTÉ', 105, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('OFFICIAL RESERVATION TICKET', 20, 55);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);

    doc.setFontSize(9);
    doc.text(`REFERENCE: ${booking.confirmationNumber}`, 20, 70);
    doc.text(`CLIENT: ${booking.clientName}`, 20, 80);
    doc.text(`SERVICE: ${booking.service}`, 20, 90);
    doc.text(`DATE: ${new Date(booking.date).toLocaleDateString()} at ${booking.time}`, 20, 100);
    doc.text(`TOTAL INVESTMENT: $${booking.price}`, 20, 110);
    doc.text(`HAIR COLOR: ${booking.hairColor || 'No specific selection'}`, 20, 120);

    if (booking.addons && booking.addons.length > 0) {
      doc.text('EXTRAS INCLUDED:', 20, 135);
      booking.addons.forEach((a: any, i: number) => {
        doc.text(`• ${a.name}`, 25, 142 + (i * 5));
      });
    }

    const startY = booking.addons && booking.addons.length > 0 ? 160 + (booking.addons.length * 5) : 140;
    doc.setFillColor(250, 250, 250);
    doc.rect(20, startY, 170, 40, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text('LA MAISON LOCATION:', 30, startY + 10);
    doc.setFontSize(8);
    doc.text('6495 New Hampshire Ave, Hyattsville, MD', 30, startY + 18);
    doc.text('Contact: +1 301 454 9435', 30, startY + 24);
    doc.text('Email: Experience@solange.hair', 30, startY + 30);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('* $30 deposit is required to secure session. Non-refundable.', 20, 280);
    doc.text('* Any complaints must be reported within 3 days maximum.', 20, 285);

    doc.save(`Solange-Ticket-${booking.confirmationNumber}.pdf`);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-br from-primary to-secondary">
      <div className="max-w-2xl w-full">
        {status === 'success' ? (
          <GlassCard className="text-center p-8 sm:p-12 md:p-16 border-2 border-green-400/30">
            <div className="text-6xl sm:text-7xl mb-6 animate-scale-in">✅</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-4">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-8">Your appointment has been successfully booked. A confirmation email has been sent to your inbox.</p>

            <div className="glass rounded-2xl p-8 mb-8 text-left space-y-4">
              <h2 className="text-2xl font-bold text-dark mb-6">Booking Details</h2>

              {booking ? (
                <>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Service</p>
                    <p className="text-lg font-semibold text-dark">{booking.service}</p>
                  </div>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="text-lg font-semibold text-dark">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Time</p>
                    <p className="text-lg font-semibold text-dark">{booking.time}</p>
                  </div>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Stylist</p>
                    <p className="text-lg font-semibold text-dark">{booking.stylist || 'Assigned at salon'}</p>
                  </div>
                  {booking.hairColor && (
                    <div className="pt-4">
                      <p className="text-gray-500 text-sm">Preferred Hair Color</p>
                      <p className="text-lg font-semibold text-accent">{booking.hairColor}</p>
                    </div>
                  )}
                  {booking.addons && booking.addons.length > 0 && (
                    <div className="pt-4">
                      <p className="text-gray-500 text-sm">Extras</p>
                      <ul className="text-lg font-semibold text-dark list-disc list-inside">
                        {booking.addons.map((a: any, i: number) => <li key={i}>{a.name}{a.price ? ` — $${a.price}` : ''}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="pt-4">
                    <p className="text-gray-500 text-sm">Confirmation Number</p>
                    <p className="text-lg font-semibold text-accent">{booking.confirmationNumber}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Service</p>
                    <p className="text-lg font-semibold text-dark">Box Braids</p>
                  </div>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="text-lg font-semibold text-dark">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Time</p>
                    <p className="text-lg font-semibold text-dark">2:00 PM</p>
                  </div>
                  <div className="border-b border-white/20 pb-4">
                    <p className="text-gray-500 text-sm">Stylist</p>
                    <p className="text-lg font-semibold text-dark">Solange Adeyemi</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Confirmation Number</p>
                    <p className="text-lg font-semibold text-accent">SLNG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-blue-900"><strong>📧 Check your email</strong> for your confirmation and care instructions. Save your confirmation number for check-in.</p>
            </div>

            <div className="space-y-4">
                {booking && <button onClick={downloadTicket} className="w-full bg-primary text-black py-3 text-[9px] uppercase tracking-[0.3em] font-semibold hover:bg-accent transition-colors">Download Ticket (PDF)</button>}
              <Link href="/" className="block"><Button className="w-full" size="lg">← Return Home</Button></Link>
              <Link href="/admin" className="block"><Button variant="outline" className="w-full" size="lg">📊 View Booking Status</Button></Link>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="text-center p-8 sm:p-12 md:p-16 border-2 border-red-400/30">
            <div className="text-6xl sm:text-7xl mb-6">❌</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-4">Booking Failed</h1>
            <p className="text-lg text-gray-600 mb-8">Unfortunately, your booking could not be processed. Please try again or contact us for assistance.</p>

            <div className="space-y-4">
              <Link href="/booking" className="block"><Button className="w-full" size="lg">🔄 Try Again</Button></Link>
              <Link href="/contact" className="block"><Button variant="outline" className="w-full" size="lg">💬 Contact Support</Button></Link>
            </div>
          </GlassCard>
        )}
      </div>
    </section>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
