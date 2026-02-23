'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch auth status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => { });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center">

            {/* Menu Desktop */}
            <div className="hidden md:flex gap-10 items-center w-1/3">
              {[
                { href: '/services', label: 'Services' },
                { href: '/about', label: 'Maison' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#C5A059] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Social Mobile (Left) */}
            <div className="flex md:hidden gap-4 items-center w-1/3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C5A059] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C5A059] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            </div>

            {/* Logo Centered (text-only signature) */}
            <Link href="/" className="flex flex-col items-center justify-center w-1/3 group">
              <span className="font-serif font-medium text-2xl tracking-[0.3em] text-[#FDFBF7] transition-opacity group-hover:text-[#C5A059]">
                SOLANGE
              </span>
              <span className="text-[7px] uppercase tracking-[0.4em] text-[#C5A059] -mt-1 opacity-80">
                Signature Hair
              </span>
            </Link>

            {/* Right Desktop */}
            <div className="hidden md:flex gap-8 items-center justify-end w-1/3">
              <div className="flex gap-4 mr-4 border-r border-[#333] pr-8">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C5A059] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C5A059] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                </a>
              </div>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="text-gray-400 hover:text-[#C5A059] transition-colors flex items-center justify-center p-1"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-4 w-40 bg-[#0A0A0A] border border-[#1A1A1A] py-2 flex flex-col items-start shadow-xl">
                      <Link
                        href="/account"
                        onClick={() => setProfileOpen(false)}
                        className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-[#111] hover:text-[#C5A059] w-full transition-colors text-left"
                      >
                        My Orders
                      </Link>
                      {(user.role === 'admin' || user.role === 'staff') && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-[#111] hover:text-[#C5A059] w-full transition-colors text-left"
                        >
                          Admin Console
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-[#111] hover:text-[#C5A059] w-full text-left transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#C5A059] transition-colors">
                    Login
                  </Link>
                </>
              )}

              <Link
                href="/booking"
                className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#C5A059] hover:text-[#FDFBF7] transition-colors border-b border-[#C5A059]/30 hover:border-[#FDFBF7] pb-1"
              >
                Reserve
              </Link>
            </div>

            {/* Mobile Toggle (Right) */}
            <div className="flex justify-end w-1/3 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex flex-col justify-center gap-[5px] w-6 h-6 z-50 mix-blend-difference"
                aria-label="Toggle mobile menu"
              >
                <span className={`w-full h-[1px] bg-white transition-all duration-500 origin-right ${mobileMenuOpen ? '-rotate-45' : ''}`}></span>
                <span className={`w-full h-[1px] bg-white transition-all duration-500 origin-right ${mobileMenuOpen ? 'rotate-45' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Mobile Menu */}
        <div className={`fixed inset-0 bg-[#0A0A0A] z-40 flex flex-col justify-start items-center transition-opacity duration-700 overflow-y-auto pt-20 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center gap-10 text-center pb-10">
            {[
              { href: '/', label: 'Home' },
              { href: '/services', label: 'Services' },
              { href: '/about', label: 'La Maison' },
              ...(user
                ? [
                  { href: '/account', label: 'My Orders' },
                  ...(user.role === 'admin' || user.role === 'staff' ? [{ href: '/admin', label: 'Admin Dashboard' }] : [])
                ]
                : [
                  { href: '/login', label: 'Login' },
                  { href: '/signup', label: 'Signup' },
                ]
              ),
              { href: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-2xl font-serif text-gray-300 hover:text-white transition-colors tracking-widest uppercase transform transition-transform duration-700 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { handleLogout(); closeMobileMenu(); }}
                className={`text-2xl font-serif text-gray-300 hover:text-white transition-colors tracking-widest uppercase transform transition-transform duration-700 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                Logout
              </button>
            )}
            <Link
              href="/booking"
              className={`mt-10 px-8 py-4 border border-[#C5A059] text-[#C5A059] text-sm tracking-[0.2em] uppercase hover:bg-[#C5A059] hover:text-white transition-all transform duration-700 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              onClick={closeMobileMenu}
            >
              Make a Reservation
            </Link>

            {/* Social Icons in mobile menu */}
            <div className={`flex gap-6 mt-4 transition-all duration-700 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#C5A059] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#C5A059] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Bottom Navigation (Liquid Glass) ─── */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[70]">
        <div className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

          {/* Home */}
          <Link href="/" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/' ? 'text-[#C5A059] scale-110' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className={`text-[8px] uppercase tracking-widest font-bold ${pathname === '/' ? 'text-[#C5A059]' : 'text-gray-600'}`}>Maison</span>
          </Link>

          {/* Services */}
          <Link href="/services" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/services' ? 'text-[#C5A059] scale-110' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l3 6v12H3V9l3-6z" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
            </svg>
            <span className={`text-[8px] uppercase tracking-widest font-bold ${pathname === '/services' ? 'text-[#C5A059]' : 'text-gray-600'}`}>Styles</span>
          </Link>

          {/* Reserve (Central Action) */}
          <Link href="/booking" className="flex flex-col items-center flex-1 -mt-8">
            <div className={`p-4 rounded-full border-4 border-[#080808] transition-all duration-500 ${pathname === '/booking' ? 'bg-[#FDFBF7] shadow-[0_0_30px_rgba(253,251,247,0.4)]' : 'bg-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.3)]'}`}>
              <svg className={`w-6 h-6 ${pathname === '/booking' ? 'text-black' : 'text-black'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </Link>

          {/* Admin or Archive */}
          {(user?.role === 'admin' || user?.role === 'staff') ? (
            <Link href="/admin" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <svg className={`w-5 h-5 transition-all duration-300 ${pathname.startsWith('/admin') ? 'text-[#C5A059] scale-110' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className={`text-[8px] uppercase tracking-widest font-bold ${pathname.startsWith('/admin') ? 'text-[#C5A059]' : 'text-gray-600'}`}>Admin</span>
            </Link>
          ) : (
            <Link href={user ? "/account" : "/login"} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/account' || pathname === '/login' ? 'text-[#C5A059] scale-110' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className={`text-[8px] uppercase tracking-widest font-bold ${pathname === '/account' || pathname === '/login' ? 'text-[#C5A059]' : 'text-gray-600'}`}>{user ? 'Moi' : 'Login'}</span>
            </Link>
          )}

          {/* Contact */}
          <Link href="/contact" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/contact' ? 'text-[#C5A059] scale-110' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className={`text-[8px] uppercase tracking-widest font-bold ${pathname === '/contact' ? 'text-[#C5A059]' : 'text-gray-600'}`}>Contact</span>
          </Link>

        </div>
      </div>
    </>
  );
}
