'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-20 lg:py-24 px-6 lg:px-12 bg-dark overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">

      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
        <span className="text-[20rem] md:text-[30rem] font-serif tracking-tighter leading-none select-none">
          S.
        </span>
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10 w-full">
        <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-8">The Invitation</span>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mb-10 leading-[1.1] tracking-tight">
          Reserve Your <br />
          <span className="italic font-light text-primary">Appointment</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto">
          <Link href="/booking" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Book Now
            </Button>
          </Link>
          <Link href="/contact" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              Contact Concierge
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
