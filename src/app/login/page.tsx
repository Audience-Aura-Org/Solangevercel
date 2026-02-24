'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            // Redirect based on role returned
            if (data.user?.role === 'admin' || data.user?.role === 'staff') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
            <div className="min-h-screen bg-dark flex flex-col justify-center items-center px-4 font-sans text-primary pt-20">
                <div className="w-full max-w-md bg-dark border border-surface p-8 md:p-12 shadow-2xl flex flex-col items-center relative overflow-hidden">
                {/* Subtle Decorative Gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

                <span className="text-[9px] uppercase tracking-[0.4em] text-accent mb-4 font-medium">Welcome Back</span>
                <h1 className="text-4xl font-serif tracking-tight mb-10 text-center text-primary">Login to <br /><span className="italic font-light text-accent">Solange.</span></h1>

                {error && (
                    <div className="w-full border-b border-red-900/50 text-red-400 text-[10px] uppercase tracking-widest text-center py-2 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-8">
                    <div>
                        <label className="block text-[8px] uppercase tracking-[0.2em] text-muted mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-surface py-2 text-sm text-primary focus:border-accent focus:outline-none transition-colors"
                            placeholder="you@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-[8px] uppercase tracking-[0.2em] text-muted mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-surface py-2 text-sm text-primary focus:border-accent focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-dark font-semibold text-[10px] uppercase tracking-[0.2em] py-4 hover:bg-accent/80 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div className="pt-4 text-center">
                        <Link href="/signup" className="text-[10px] uppercase tracking-[0.1em] text-muted hover:text-accent transition-colors border-b border-transparent hover:border-accent pb-1">
                            New here? Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
