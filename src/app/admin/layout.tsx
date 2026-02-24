'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
    { label: 'Overview', href: '/admin' },
    { label: 'Calendar', href: '/admin/calendar' },
    { label: 'Bookings', href: '/admin/bookings' },
    { label: 'Clients', href: '/admin/clients' },
    { label: 'Services', href: '/admin/services' },
    { label: 'Addons', href: '/admin/addons' },
    { label: 'Notifications', href: '/admin/notifications' },
    { label: 'Disputes', href: '/admin/disputes' },
    { label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    if (pathname === '/admin/login') return <>{children}</>;

    const currentLabel = navItems.find(n => n.href === pathname)?.label ?? 'Admin';

    return (
        <div className="min-h-screen bg-[#060606] text-[#FDFBF7] flex font-poppins overflow-x-hidden">

            {/* ─── Sidebar ─── */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-[#060606] border-r border-[#141414] flex flex-col transition-transform duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                {/* Wordmark */}
                <div className="px-7 pt-10 pb-8 border-b border-[#141414]">
                    <Link href="/" className="block group">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059]/60 block mb-2">La Maison</span>
                        <span className="text-xl font-serif tracking-[0.25em] text-[#FDFBF7] group-hover:text-[#C5A059] transition-colors duration-300">
                            SOLANGE
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6">
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`relative flex items-center gap-4 px-7 py-3.5 transition-all duration-200 group ${isActive
                                    ? 'text-[#FDFBF7] font-bold'
                                    : 'text-[#404040] hover:text-[#808080]'
                                    }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                                )}
                                <span className="text-[9px] text-[#C5A059]/50 font-mono tabular-nums">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-quicksand">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="border-t border-[#141414] py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-4 px-7 py-3 text-[#303030] hover:text-[#606060] transition-colors"
                    >
                        <span className="text-[9px] font-mono">↗</span>
                        <span className="text-[10px] uppercase tracking-[0.2em]">View Site</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-7 py-3 text-[#303030] hover:text-red-600/70 transition-colors"
                    >
                        <span className="text-[9px] font-mono">←</span>
                        <span className="text-[10px] uppercase tracking-[0.2em]">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 lg:ml-56 flex flex-col min-h-screen overflow-hidden">

                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-8 bg-[#060606]/95 backdrop-blur-sm border-b border-[#141414]">

                    {/* Mobile menu */}
                    <button className="lg:hidden text-[#404040] hover:text-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink overflow-hidden">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.35em] text-[#404040]">Admin</span>
                        <span className="text-[#282828]">/</span>
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.35em] text-[#C5A059] truncate">{currentLabel}</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#404040]">Live</span>
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10 lg:px-12 lg:py-12 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
