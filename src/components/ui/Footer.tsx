'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/lib/hooks/useSiteSettings';
import { useEffect, useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { instagram, tiktok, email, phone, address } = useSiteSettings();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const themeAttr = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(themeAttr as 'light' | 'dark');
  }, []);

  // Derive display-friendly strings
  const displayEmail = email || 'Experience@solange.hair';
  const displayPhone = phone || '+1 301 454 9435';
  const displayAddress = address || '6495 New Hampshire Ave\nHyattsville, MD';
  const addressLines = displayAddress.split('\n').filter(Boolean);

  return (
    <footer className={`border-t transition-all ${theme === 'light' ? 'bg-white border-black/10' : 'bg-dark-surface border-surface'} py-16 px-6 lg:px-12 text-center md:text-left`}>
      <div className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-12 border-b ${theme === 'light' ? 'border-black/10' : 'border-surface'} pb-16 mb-8`}>

        <div className="flex flex-col items-center md:items-start mx-auto md:mx-0">
          <Link href="/" className="group flex flex-col items-center md:items-start mx-auto md:mx-0">
            <span className={`font-serif font-medium text-4xl tracking-[0.3em] block hover:opacity-70 transition-opacity ${theme === 'light' ? 'text-black' : 'text-primary'}`}>
              SOLANGE
            </span>
            <span className="text-[8px] uppercase tracking-[0.4em] text-primary mt-1 opacity-70">
              Signature Hair
            </span>
          </Link>
          <p className={`text-sm font-light tracking-wide max-w-sm mx-auto md:mx-0 ${theme === 'light' ? 'text-black/40' : 'text-primary'}`}>
            La Maison de Beauté. Unparalleled craftsmanship, precision, and luxury.
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-12 text-xs uppercase tracking-[0.2em] w-full md:w-auto text-center md:text-left ${theme === 'light' ? 'text-black/40' : 'text-primary'}`}>

          <div className="flex flex-col gap-4 items-center md:items-start mx-auto md:mx-0">
            <h4 className="text-primary mb-4 font-medium">Menu</h4>
            <Link href="/services" className={`transition-colors ${theme === 'light' ? 'hover:text-black text-black/60' : 'hover:text-white text-primary'}`}>Services</Link>
            <Link href="/about" className={`transition-colors ${theme === 'light' ? 'hover:text-black text-black/60' : 'hover:text-white text-primary'}`}>La Maison</Link>
            <Link href="/booking" className={`transition-colors ${theme === 'light' ? 'hover:text-black text-black/60' : 'hover:text-white text-primary'}`}>Reserve</Link>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start mx-auto md:mx-0">
            <h4 className="text-primary mb-4 font-medium">Social</h4>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black text-black/60' : 'hover:text-white text-primary'}`}>
              Instagram
            </a>
            <a href={tiktok} target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black text-black/60' : 'hover:text-white text-primary'}`}>
              TikTok
            </a>
            <Link href="/contact" className={`transition-colors ${theme === 'light' ? 'hover:text-black text-black/60' : 'hover:text-white text-primary'}`}>Contact</Link>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start mx-auto md:mx-0 col-span-1">
            <h4 className="text-primary mb-4 font-medium text-center md:text-left">Concierge</h4>
            {addressLines.map((line, i) => (
              <span key={i} className={theme === 'light' ? 'text-black/60' : 'text-primary'}>{line}</span>
            ))}
            <a href={`tel:${displayPhone.replace(/\s/g, '')}`} className={`transition-colors ${theme === 'light' ? 'text-black/80 hover:text-black' : 'text-primary hover:text-white'}`}>
              {displayPhone}
            </a>
            <a href={`mailto:${displayEmail}`} className={`transition-colors normal-case ${theme === 'light' ? 'text-black/60 hover:text-black' : 'text-primary hover:text-white'}`}>
              {displayEmail}
            </a>
          </div>

        </div>

      </div>

      <div className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-center ${theme === 'light' ? 'text-black/20' : 'text-primary'}`}>
        <p>&copy; {currentYear} SOLANGE. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8 justify-center">
          <Link href="/privacy" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-primary'}`}>Privacité</Link>
          <Link href="/terms" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-primary'}`}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}
