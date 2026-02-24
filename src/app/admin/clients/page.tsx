'use client';

import { useEffect, useState } from 'react';

type Client = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
};

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/clients')
            .then(r => r.json())
            .then(data => { setClients(data.clients || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const deleteClient = async (id: string) => {
        if (!confirm('Remove this client from the registry?')) return;
        await fetch('/api/admin/clients', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        setClients(prev => prev.filter(c => c._id !== id));
    };

    const filtered = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-10">

            {/* Header */}
            <div className="border-b border-[#141414] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mb-3">Registry</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#FDFBF7] tracking-tight leading-none">Clients</h1>
                </div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-medium">
                    {filtered.length} client{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-b border-[#222] py-2 text-xs text-[#FDFBF7] placeholder-gray-600 focus:outline-none focus:border-[#C5A059] w-full sm:w-72 transition-colors"
            />

            {/* Table */}
            <div className="border border-[#141414] bg-[#060606] overflow-hidden rounded-sm">
                <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
                    {loading ? (
                        <div className="p-12 text-center text-[9px] uppercase tracking-widest text-gray-500 animate-pulse">
                            Loading registry...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-[9px] uppercase tracking-widest text-gray-500">
                            No clients found.
                        </div>
                    ) : (
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[#141414] bg-[#0A0A0A] sticky top-0">
                                    {['Name', 'Email', 'Phone', 'Type', 'Since', ''].map(h => (
                                        <th key={h} className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[7px] sm:text-[9px] uppercase tracking-[0.3em] text-gray-400 font-medium">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => (
                                    <tr
                                        key={c._id}
                                        className={`group hover:bg-[#0A0A0A] transition-colors ${i !== filtered.length - 1 ? 'border-b border-[#0E0E0E]' : ''}`}
                                    >
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-[#FDFBF7]">{c.name}</td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[11px] text-gray-300 truncate">{c.email}</td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[11px] text-[#C5A059] font-mono truncate">{c.phone || '—'}</td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <span className={`text-[7px] sm:text-[9px] uppercase tracking-widest font-semibold ${c.role === 'admin' ? 'text-[#C5A059]' : 'text-gray-500'}`}>
                                                {c.role}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                            <button
                                                onClick={() => deleteClient(c._id)}
                                                className="text-[7px] sm:text-[9px] uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
