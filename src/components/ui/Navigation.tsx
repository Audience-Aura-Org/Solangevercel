'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/lib/hooks/useSiteSettings';

export default function Navigation() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { instagram, tiktok } = useSiteSettings();

  useEffect(() => {
    // Get theme from DOM attribute set by ThemeProvider
    const themeAttr = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(themeAttr as 'light' | 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

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

  // Prevent body scroll when mobile menu is open so the menu fully overlays content
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && (
        <nav className={`fixed top-0 left-0 w-full z-[70] transition-all duration-700 ${scrolled ? (theme === 'light' ? 'bg-white/90 backdrop-blur-xl border-b border-black/5 py-4' : 'bg-dark-surface/90 backdrop-blur-xl border-b border-white/5 py-4') : 'bg-transparent py-8'}`}>
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
                    className={`text-[10px] uppercase tracking-[0.2em] font-medium ${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Social Mobile (Left) */}
              <div className="flex md:hidden gap-4 items-center w-1/3">
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={`${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                </a>
              </div>

              {/* Logo Centered (text-only signature) */}
              <Link href="/" className="flex flex-col items-center justify-center w-1/3 group">
                <span className="font-serif font-medium text-2xl tracking-[0.3em] text-primary transition-opacity group-hover:text-primary">
                  SOLANGE
                </span>
                <span className="text-[7px] uppercase tracking-[0.4em] text-primary -mt-1 opacity-80">
                  Signature Hair
                </span>
              </Link>

              {/* Right Desktop */}
              <div className="hidden md:flex gap-8 items-center justify-end w-1/3">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className={`${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors duration-300 p-2 rounded-lg hover:bg-white/5`}
                  aria-label="Toggle theme"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>

                <div className={`flex gap-4 mr-4 border-r ${theme === 'light' ? 'border-black/10' : 'border-surface'} pr-8`}>
                  <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                  </a>
                  <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={`${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                  </a>
                </div>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={`${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors flex items-center justify-center p-1`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </button>

                    {profileOpen && (
                      <div className={`absolute top-full right-0 mt-4 w-40 border py-2 flex flex-col items-start shadow-xl transition-all ${theme === 'light' ? 'bg-white border-black/10' : 'bg-dark-surface border-surface'}`}>
                        <Link
                          href="/account"
                          onClick={() => setProfileOpen(false)}
                          className={`px-4 py-3 text-[10px] uppercase tracking-[0.2em] w-full transition-colors text-left ${theme === 'light' ? 'text-black hover:bg-black/5 hover:text-primary' : 'text-gray-400 hover:bg-dark hover:text-accent'}`}
                        >
                          My Orders
                        </Link>
                        {(user.role === 'admin' || user.role === 'staff') && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className={`px-4 py-3 text-[10px] uppercase tracking-[0.2em] w-full transition-colors text-left ${theme === 'light' ? 'text-black hover:bg-black/5 hover:text-primary' : 'text-gray-400 hover:bg-dark hover:text-accent'}`}
                          >
                            Admin Console
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className={`px-4 py-3 text-[10px] uppercase tracking-[0.2em] w-full text-left transition-colors ${theme === 'light' ? 'text-black hover:bg-black/5 hover:text-primary' : 'text-gray-400 hover:bg-dark hover:text-accent'}`}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login" className={`text-[10px] uppercase tracking-[0.2em] font-medium ${theme === 'light' ? 'text-black' : 'text-gray-400'} hover:text-accent transition-colors`}>
                      Login
                    </Link>
                  </>
                )}

                <Link
                  href="/booking"
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-accent hover:text-primary transition-colors border-b border-accent/30 hover:border-primary pb-1"
                >
                  Reserve
                </Link>
              </div>

              {/* Mobile Toggle (Right) */}
              <div className="flex justify-end w-1/3 md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`flex flex-col justify-center gap-[5px] w-6 h-6 ${mobileMenuOpen ? 'z-[70]' : 'z-[50]'} relative`}
                  aria-label="Toggle mobile menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <span className={`w-full h-[1.5px] ${theme === 'light' ? 'bg-black' : 'bg-white'} transition-all duration-500 origin-right ${mobileMenuOpen ? '-rotate-45' : ''}`}></span>
                  <span className={`w-full h-[1.5px] ${theme === 'light' ? 'bg-black' : 'bg-white'} transition-all duration-500 origin-right ${mobileMenuOpen ? 'rotate-45' : ''}`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Mobile Menu */}
          <div className={`fixed inset-0 z-[80] flex flex-col justify-start items-center transition-all duration-700 overflow-y-auto pt-20 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${theme === 'light' ? 'bg-white' : 'bg-dark-surface'}`}>
            {/* Close button inside overlay so user can always dismiss the menu */}
            <button
              aria-label="Close mobile menu"
              onClick={() => setMobileMenuOpen(false)}
              className={`absolute top-6 right-6 p-3 rounded-md ${theme === 'light' ? 'text-black bg-white/0' : 'text-white bg-transparent'} z-[70]`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
                  className={`text-2xl font-serif transition-colors tracking-widest uppercase transform transition-transform duration-700 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${theme === 'light' ? 'text-black/60 hover:text-black' : 'text-gray-300 hover:text-white'}`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => { handleLogout(); closeMobileMenu(); }}
                  className={`text-2xl font-serif transition-colors tracking-widest uppercase transform transition-transform duration-700 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${theme === 'light' ? 'text-black/60 hover:text-black' : 'text-gray-300 hover:text-white'}`}
                >
                  Logout
                </button>
              )}
              <Link
                href="/booking"
                className={`mt-10 px-8 py-4 border text-sm tracking-[0.2em] uppercase hover:text-white transition-all transform duration-700 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${theme === 'light' ? 'border-black text-black hover:bg-black' : 'border-accent text-accent hover:bg-primary'}`}
                onClick={closeMobileMenu}
              >
                Make a Reservation
              </Link>

              {/* Social Icons in mobile menu */}
              <div className={`flex gap-6 mt-4 transition-all duration-700 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`transition-colors ${theme === 'light' ? 'text-black/40 hover:text-primary' : 'text-gray-500 hover:text-accent'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={`transition-colors ${theme === 'light' ? 'text-black/40 hover:text-primary' : 'text-gray-500 hover:text-accent'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                </a>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* ─── Mobile Bottom Navigation (Liquid Glass) ─── */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[70]">
        <div className={`border rounded-2xl px-4 py-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${theme === 'light' ? 'bg-white/80 backdrop-blur-3xl border-black/10' : 'bg-dark-surface/80 backdrop-blur-3xl border-white/10'}`}>

          {/* Home */}
          <Link href="/" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/' ? 'scale-110' : ''} ${pathname === '/' ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-500')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${pathname === '/' ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-600')}`}>Maison</span>
          </Link>

          {/* Services */}
          <Link href="/services" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/services' ? 'scale-110' : ''} ${pathname === '/services' ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-500')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l3 6v12H3V9l3-6z" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
            </svg>
            <span className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${pathname === '/services' ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-600')}`}>Styles</span>
          </Link>

          {/* Reserve (Central Action) */}
          <Link href="/booking" className="flex flex-col items-center flex-1 -mt-8">
            <div className={`p-4 rounded-full border-4 transition-all duration-500 ${theme === 'light' ? `border-black/10 ${pathname === '/booking' ? 'bg-black shadow-[0_0_30px_rgba(0,0,0,0.3)]' : 'bg-primary shadow-[0_0_20px_rgba(212,163,115,0.3)]'}` : `border-dark ${pathname === '/booking' ? 'bg-light shadow-[0_0_30px_rgba(253,251,247,0.4)]' : 'bg-primary shadow-[0_0_20px_rgba(197,160,89,0.3)]'}`}`}>
              <svg className={`w-6 h-6 ${pathname === '/booking' ? (theme === 'light' ? 'text-white' : 'text-black') : 'text-black'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <svg className={`w-5 h-5 transition-all duration-300 ${pathname.startsWith('/admin') ? 'scale-110' : ''} ${pathname.startsWith('/admin') ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-500')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${pathname.startsWith('/admin') ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-600')}`}>Admin</span>
            </Link>
          ) : (
            <Link href={user ? "/account" : "/login"} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <svg className={`w-5 h-5 transition-all duration-300 ${(pathname === '/account' || pathname === '/login') ? 'scale-110' : ''} ${(pathname === '/account' || pathname === '/login') ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-500')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${(pathname === '/account' || pathname === '/login') ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-600')}`}>{user ? 'Moi' : 'Login'}</span>
            </Link>
          )}

          {/* Contact */}
          <Link href="/contact" className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <svg className={`w-5 h-5 transition-all duration-300 ${pathname === '/contact' ? 'scale-110' : ''} ${pathname === '/contact' ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-500')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${pathname === '/contact' ? (theme === 'light' ? 'text-primary' : 'text-accent') : (theme === 'light' ? 'text-black/40' : 'text-gray-600')}`}>Contact</span>
          </Link>

        </div>
      </div>
    </>
  );
}
