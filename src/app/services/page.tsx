'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SERVICES = [
  {
    id: 'box-braids',
    n: '01',
    title: 'Box Braids',
    tag: 'Most Requested',
    headline: 'The definitive protective braid. Structural, lasting, and effortlessly elegant.',
    description:
      'Our signature box braids are installed with precision-parted squared sections and premium 100% human hair extensions. Each braid is crafted with consistent tension to maximise longevity and scalp comfort — never tight, always immaculate.',
    sizes: [
      { label: 'Small', price: '$250', duration: '6 hrs' },
      { label: 'Medium', price: '$200', duration: '4 hrs' },
      { label: 'Large', price: '$150', duration: '3 hrs' },
    ],
    longevity: '6–8 weeks',
    benefits: ['Tension-free installation', 'Premium human hair extensions', 'All hair types welcomed', '6–8 week wear life', 'Low daily maintenance'],
    care: ['Sleep on satin/silk pillowcase', 'Co-wash weekly, clarify monthly', 'Keep scalp moisturised with light oil', 'Refresh edges every 4 weeks', 'Avoid chlorine without protective cap'],
  },
  {
    id: 'knotless',
    n: '02',
    title: 'Knotless Braids',
    tag: 'Signature',
    headline: 'No bulge at the root. No tension. Just a seamless, natural finish from crown to tip.',
    description:
      'The evolution of the classic box braid. Knotless installation begins with your natural hair and gradually integrates extensions — eliminating the raised knot at the root entirely. The result is lighter, more flexible, and significantly more comfortable for sensitive scalps.',
    sizes: [
      { label: 'Small', price: '$300', duration: '7 hrs' },
      { label: 'Medium', price: '$250', duration: '5 hrs' },
      { label: 'Large', price: '$200', duration: '4 hrs' },
    ],
    longevity: '6–10 weeks',
    benefits: ['Zero tension at root', 'Invisible parting', 'Natural scalp look', 'Ideal for sensitive scalps', 'Longest wear life in our catalogue'],
    care: ['Gentle scalp massages 3× week', 'Avoid heavy product build-up', 'Re-dip ends at 4 weeks to refresh', 'Keep ends moisturised daily', 'Remove carefully at 10 weeks maximum'],
  },
  {
    id: 'cornrows',
    n: '03',
    title: 'Signature Cornrows',
    tag: 'Editorial',
    headline: 'Architecture for your crown. Sculptural pattern work with razor-sharp precision.',
    description:
      'Whether you want classic straight-backs, double Dutch, curved designs, or fully bespoke geometric patterns — our cornrow specialists deliver clean, symmetric, and intentional results. The perfect foundation or standalone editorial look.',
    sizes: [
      { label: 'Small / Detailed Pattern', price: '$180', duration: '4 hrs' },
      { label: 'Medium / 6–8 Rows', price: '$120', duration: '2 hrs' },
      { label: 'Large / 2–4 Feed-ins', price: '$80', duration: '90 min' },
    ],
    longevity: '3–4 weeks',
    benefits: ['Fast install time', 'Precision symmetric parting', 'Natural or feed-in styles', 'Great foundation for unit/wig', 'Custom pattern design available'],
    care: ['Wrap with silk/satin scarf nightly', 'Moisturise edges daily', 'Avoid excess moisture at roots', 'Do not over-manipulate the style', 'Refresh at 3–4 weeks for best results'],
  },
  {
    id: 'locs',
    n: '04',
    title: 'Luxury Locs',
    tag: 'Cultivate',
    headline: 'A long-term commitment to the most natural, liberated style. Expertly guided.',
    description:
      'Whether you are beginning your loc journey or maintaining an established set, our loc specialists bring both technique and reverence to the process. We offer start locs via coil, palm roll, or two-strand — alongside regular maintenance and retwist appointments.',
    sizes: [
      { label: 'Starter Locs', price: '$200+', duration: '4–6 hrs' },
      { label: 'Retwist / Maintenance', price: '$120', duration: '2–3 hrs' },
      { label: 'Interlock', price: '$150', duration: '3–4 hrs' },
    ],
    longevity: 'Permanent (retwist every 4–6w)',
    benefits: ['Permanent protective style', 'Minimal daily styling', 'Scalp health focused care', 'Works with any loc thickness', 'Expert guidance throughout journey'],
    care: ['Retwist every 4–6 weeks', 'Wash with residue-free shampoo', 'Deep condition monthly', 'Avoid wax-based products', 'Dry thoroughly after washing'],
  },
  {
    id: 'twists',
    n: '05',
    title: 'Passion Twists',
    tag: 'Volume & Texture',
    headline: 'Soft Bohemian volume. A lighter, effortless take on the textured protective style.',
    description:
      'Our passion twist service uses premium crochet hair to create full, even spirals from root to end. The finish is natural, lightweight, and moves freely — equally at home on an editorial set or a beach. Senegalese, Spring Twist, and Kinky variations available.',
    sizes: [
      { label: 'Long (waist+)', price: '$180', duration: '4 hrs' },
      { label: 'Mid-length', price: '$150', duration: '3 hrs' },
      { label: 'Short / Bob', price: '$120', duration: '2 hrs' },
    ],
    longevity: '4–6 weeks',
    benefits: ['Lightweight and free-moving', 'Bohemian natural look', 'Less tension than box braids', 'Multiple length options', 'Great for colour experimentation'],
    care: ['Moisturise with water + leave-in spray', 'Sleep in loose bun with satin', 'Avoid excessive manipulation', 'Refresh roots at 3 weeks', 'Remove carefully to preserve natural hair'],
  },
  {
    id: 'bespoke',
    n: '06',
    title: 'Custom Artistry',
    tag: 'By Quote',
    headline: 'Your vision, with no compromise. A private creative commission with our master braiders.',
    description:
      'For clients who arrive with a reference board, a vision, or simply a desire for something entirely unique — we offer bespoke consultation and commission appointments. Whether for editorial shoots, weddings, or special occasions, our artisans will design and execute something made only for you.',
    sizes: [
      { label: 'Private Consultation', price: 'Complimentary', duration: '30 min' },
      { label: 'Full Commission', price: 'By Quote', duration: 'Flexible' },
    ],
    longevity: 'Varies by style',
    benefits: ['Complete creative collaboration', 'Occasion & editorial styles', 'One-of-a-kind design', 'Priority scheduling', 'Mood board review included'],
    care: ['Aftercare provided at appointment', 'Style-specific maintenance plan', 'Follow-up consultation available'],
  },
];

export default function ServicesPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/siteSettings')
      .then(res => res.json())
      .then(data => {
        const dbServices = data.settings?.services;
        if (dbServices && dbServices.length > 0) {
          // Map DB structure to page structure
          const mapped = dbServices.map((s: any, i: number) => ({
            id: s.id,
            n: `0${i + 1}`,
            title: s.name,
            tag: i === 0 ? 'Most Requested' : i === 1 ? 'Signature' : 'Editorial',
            headline: s.description || 'Professional braiding artistry tailored to your crown.',
            description: s.description || 'Professional braiding artistry tailored to your crown.',
            sizes: s.sizes.map((sz: any) => ({
              label: sz.size,
              price: `$${sz.price}`,
              duration: `${sz.duration} min`
            })),
            longevity: '6–8 weeks',
            benefits: ['Tension-free installation', 'Premium extensions', 'Scalp comfort focused', 'Longevity focused'],
            care: ['Sleep with satin scarf', 'Moisturize regularly', 'Avoid over-manipulation']
          }));
          setServices(mapped);
          if (mapped.length > 0) setOpen(mapped[0].id);
        } else {
          setServices(SERVICES);
          setOpen('box-braids');
        }
      })
      .catch(() => {
        setServices(SERVICES);
        setOpen('box-braids');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-[9px] uppercase tracking-widest text-muted animate-pulse">
        Loading Catalog...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark text-primary pt-24 lg:pt-32 pb-24">

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-16 border-b border-surface pb-14 text-center md:text-left">
        <span className="text-[9px] uppercase tracking-[0.45em] text-accent block mb-4">Le Menu</span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-none tracking-tight">
            Our<br className="hidden md:block" /><span className="italic font-light text-accent md:ml-0 ml-2">Services.</span>
          </h1>
          <div className="max-w-sm mx-auto md:mx-0">
            <p className="text-sm text-muted leading-relaxed font-light mb-6">
              Six categories. Every size. One standard — absolute precision. Browse the full catalogue below.
            </p>
            <Link href="/booking"
              className="inline-block text-[9px] uppercase tracking-[0.3em] text-accent border-b border-accent pb-1 hover:text-primary hover:border-accent transition-all">
              Book a Session →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Accordion Catalogue ─────────────────────────────────────── */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto space-y-px">
        {services.map((svc) => {
          const isOpen = open === svc.id;
          return (
            <div key={svc.id} className="border border-surface bg-dark">

              {/* ── Accordion Trigger ── */}
              <button
                className="w-full text-left px-6 py-6 flex items-center justify-between gap-4 group hover:bg-dark transition-colors"
                onClick={() => setOpen(isOpen ? null : svc.id)}
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <span className="text-[9px] font-mono text-muted shrink-0">{svc.n}</span>
                  <h2 className={`text-xl md:text-2xl font-serif leading-none transition-colors ${isOpen ? 'text-accent' : 'text-primary group-hover:text-accent'}`}>
                    {svc.title}
                  </h2>
                  <span className="text-[7px] uppercase tracking-[0.25em] text-accent border border-accent px-2 py-0.5 hidden sm:block shrink-0">
                    {svc.tag}
                  </span>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                  <span className="text-sm text-accent tabular-nums hidden sm:block">
                    {svc.sizes[svc.sizes.length - 1].price}
                  </span>
                  <span className={`text-lg text-accent transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                </div>
              </button>

              {/* ── Expanded Panel ── */}
              {isOpen && (
                <div className="border-t border-surface grid md:grid-cols-[1fr_320px] gap-px bg-surface">

                  {/* Left: Info */}
                  <div className="bg-dark p-6 lg:p-8 space-y-8">

                    <div>
                      <h3 className="text-base font-serif text-accent italic mb-3 leading-snug max-w-xl">
                        &ldquo;{svc.headline}&rdquo;
                      </h3>
                      <p className="text-sm text-muted leading-relaxed max-w-2xl font-light">
                        {svc.description}
                      </p>
                    </div>

                    {/* Benefits */}
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.35em] text-muted mb-4">What&apos;s Included</p>
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                        {svc.benefits.map((b: string) => (
                          <div key={b} className="flex items-start gap-3">
                            <span className="text-accent text-[10px] mt-0.5 shrink-0">—</span>
                            <span className="text-xs text-muted">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Longevity + Care */}
                    <div className="grid sm:grid-cols-2 gap-8 border-t border-surface pt-6">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.35em] text-muted mb-3">Wear Life</p>
                        <p className="text-sm text-primary font-serif">{svc.longevity}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.35em] text-muted mb-3">Care Guide</p>
                        <ul className="space-y-1.5">
                          {svc.care.map((c: string) => (
                            <li key={c} className="text-[10px] text-muted leading-relaxed">· {c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Link
                      href="/booking"
                      className="inline-block text-[9px] uppercase tracking-[0.3em] text-accent border-b border-accent pb-1 hover:text-primary hover:border-accent transition-all"
                    >
                      Book {svc.title} →
                    </Link>
                  </div>

                  {/* Right: Pricing Table */}
                  <div className="bg-dark p-6 lg:p-8">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-muted mb-5">Pricing</p>
                    <div className="space-y-px">
                      {svc.sizes.map((sz: any, i: number) => (
                        <div
                          key={sz.label}
                          className={`flex items-center justify-between py-4 px-4 transition-colors ${i === 0 ? 'bg-accent/5 border border-accent' : 'bg-dark border border-surface'}`}
                        >
                          <div>
                            <p className="text-xs text-primary">{sz.label}</p>
                            <p className="text-[9px] text-muted mt-0.5">{sz.duration}</p>
                          </div>
                          <span className={`text-sm tabular-nums ${i === 0 ? 'text-accent' : 'text-primary'}`}>{sz.price}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[8px] text-muted mt-4 leading-relaxed">
                      All prices are starting rates. Final quote provided at consultation based on hair length and density.
                    </p>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ─── Bespoke CTA ─────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto mt-20 border border-surface bg-dark">
        <div className="py-12 lg:py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="mx-auto md:mx-0">
            <span className="text-[8px] uppercase tracking-[0.4em] text-accent block mb-3">Bespoke Services</span>
            <h2 className="text-3xl font-serif text-primary leading-tight max-w-md mx-auto md:mx-0">
              Looking for something outside the catalogue?
            </h2>
            <p className="text-xs text-muted mt-4 max-w-md leading-relaxed mx-auto md:mx-0">
              We welcome custom requests for editorial shoots, weddings, events, and everything in between. Our artisans will design specifically for you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 justify-center">
            <Link href="/contact"
              className="border border-surface text-muted hover:border-accent hover:text-accent py-3 px-6 text-[9px] uppercase tracking-[0.3em] transition-all text-center">
              Request Quote
            </Link>
            <Link href="/booking"
              className="bg-accent text-dark hover:bg-accent/80 py-3 px-6 text-[9px] uppercase tracking-[0.3em] font-semibold transition-all text-center">
              Book Now
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
