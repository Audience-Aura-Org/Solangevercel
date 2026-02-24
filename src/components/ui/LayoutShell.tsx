'use client';

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState<'in' | 'out'>('in');
    const prevPath = useRef(pathname);

    useEffect(() => {
        if (pathname !== prevPath.current) {
            // Fade out quickly then swap content and fade back in
            setTransitionStage('out');
            const timer = setTimeout(() => {
                setDisplayChildren(children);
                prevPath.current = pathname;
                setTransitionStage('in');
            }, 150); // match the CSS transition duration
            return () => clearTimeout(timer);
        } else {
            setDisplayChildren(children);
        }
    }, [pathname, children]);

    return (
        <>
            <Navigation />
            <main
                className={isAdmin ? '' : 'min-h-screen'}
                style={{
                    opacity: transitionStage === 'in' ? 1 : 0,
                    transition: 'opacity 150ms ease-in-out',
                    willChange: 'opacity',
                }}
            >
                {displayChildren}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
