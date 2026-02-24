'use client';

import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────
type SizeVariant = { id: string; size: string; price: number; duration: number };
type ServiceCategory = { id: string; name: string; description: string; sizes: SizeVariant[] };

const DEFAULT_SERVICES: ServiceCategory[] = [
    {
        id: 'box-braids', name: 'Premium Box Braids', description: 'Classic tension-free structural partings.',
        sizes: [
            { id: 'bb-s', size: 'Small', price: 250, duration: 360 },
            { id: 'bb-m', size: 'Medium', price: 200, duration: 240 },
            { id: 'bb-l', size: 'Large', price: 150, duration: 180 },
        ],
    },
    {
        id: 'knotless-braids', name: 'Knotless Braids', description: 'Seamless, painless roots with an invisible finish.',
        sizes: [
            { id: 'kb-s', size: 'Small', price: 300, duration: 420 },
            { id: 'kb-m', size: 'Medium', price: 250, duration: 300 },
            { id: 'kb-l', size: 'Large', price: 200, duration: 240 },
        ],
    },
    {
        id: 'cornrows', name: 'Signature Cornrows', description: 'Architectural straight-backs or custom patterns.',
        sizes: [
            { id: 'cr-s', size: 'Small / Detailed Pattern', price: 180, duration: 240 },
            { id: 'cr-m', size: 'Medium / Standard 6-8', price: 120, duration: 120 },
            { id: 'cr-l', size: 'Large / 2-4 Feed-ins', price: 80, duration: 90 },
        ],
    },
];

function genId(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
}

// ─── Inline Size Row ──────────────────────────────
function SizeRow({
    sz, si, zi, onUpdate, onRemove,
}: {
    sz: SizeVariant;
    si: number;
    zi: number;
    onUpdate: (si: number, zi: number, key: keyof SizeVariant, val: string | number) => void;
    onRemove: (si: number, zi: number) => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-3 sm:px-6 py-3 sm:py-4 border-b border-[#0E0E0E] last:border-0 group text-[10px]">
            <input
                value={sz.size}
                onChange={e => onUpdate(si, zi, 'size', e.target.value)}
                placeholder="Size label (e.g. Small)"
                className="flex-1 min-w-0 bg-transparent border-b border-[#222] py-1 text-[10px] text-[#FDFBF7] focus:border-[#C5A059] outline-none transition-colors"
            />
            <label className="flex flex-col gap-1">
                <span className="text-[7px] uppercase tracking-[0.2em] text-[#303030]">Price ($)</span>
                <input
                    type="number" value={sz.price}
                    onChange={e => onUpdate(si, zi, 'price', Number(e.target.value))}
                    className="w-16 bg-transparent border-b border-[#222] py-1 text-xs text-[#C5A059] focus:border-[#C5A059] outline-none tabular-nums"
                />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-[7px] uppercase tracking-[0.2em] text-[#303030]">Duration (min)</span>
                <input
                    type="number" value={sz.duration}
                    onChange={e => onUpdate(si, zi, 'duration', Number(e.target.value))}
                    className="w-16 bg-transparent border-b border-[#222] py-1 text-xs text-[#606060] focus:border-[#C5A059] outline-none tabular-nums"
                />
            </label>
            <button
                onClick={() => onRemove(si, zi)}
                className="text-[7px] sm:text-[8px] uppercase tracking-widest text-[#303030] hover:text-red-500/80 transition-colors sm:ml-auto opacity-0 group-hover:opacity-100 self-start sm:self-auto"
            >
                Remove
            </button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────
export default function AdminServicesPage() {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [saved, setSaved] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [addingCat, setAddingCat] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/siteSettings')
            .then(r => r.json())
            .then(data => {
                const dbServices = data.settings?.services;
                if (dbServices && dbServices.length > 0) {
                    setServices(dbServices);
                } else {
                    setServices(DEFAULT_SERVICES);
                }
                setLoading(false);
            })
            .catch(() => {
                setServices(DEFAULT_SERVICES);
                setLoading(false);
            });
    }, []);

    // Update individual size field
    const updateSize = (si: number, zi: number, key: keyof SizeVariant, val: string | number) => {
        setServices(prev => {
            const s = prev.map(cat => ({ ...cat, sizes: [...cat.sizes] }));
            (s[si].sizes[zi] as any)[key] = val;
            return s;
        });
        setSaved(false);
    };

    // Remove size variant
    const removeSize = (si: number, zi: number) => {
        setServices(prev => {
            const s = prev.map(cat => ({ ...cat, sizes: [...cat.sizes] }));
            s[si].sizes.splice(zi, 1);
            return s;
        });
        setSaved(false);
    };

    // Add new size to existing category
    const addSize = (si: number) => {
        setServices(prev => {
            const s = prev.map(cat => ({ ...cat, sizes: [...cat.sizes] }));
            s[si].sizes.push({ id: genId('new-size'), size: '', price: 0, duration: 60 });
            return s;
        });
        setSaved(false);
    };

    // Update category name/description
    const updateCat = (si: number, key: 'name' | 'description', val: string) => {
        setServices(prev => {
            const s = [...prev];
            s[si] = { ...s[si], [key]: val };
            return s;
        });
        setSaved(false);
    };

    // Remove entire category
    const removeCat = (si: number) => {
        if (!confirm('Remove this service category and all its size variants?')) return;
        setServices(prev => prev.filter((_, i) => i !== si));
        setSaved(false);
    };

    // Add new category
    const addCategory = () => {
        if (!newCatName.trim()) return;
        const newCat: ServiceCategory = {
            id: genId(newCatName),
            name: newCatName.trim(),
            description: newCatDesc.trim(),
            sizes: [{ id: genId('size'), size: 'Small', price: 0, duration: 60 }],
        };
        setServices(prev => [...prev, newCat]);
        setNewCatName('');
        setNewCatDesc('');
        setAddingCat(false);
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/admin/siteSettings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ services }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (e) {
            console.error('Failed to save services', e);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl py-12 text-center text-[9px] uppercase tracking-widest text-[#404040] animate-pulse">
                Loading configuration...
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-10">

            {/* Header */}
            <div className="border-b border-[#141414] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#404040] mb-3">Configuration</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#FDFBF7] tracking-tight leading-none">Services</h1>
                </div>
                <div className="flex gap-6 items-center">
                    <button
                        onClick={() => setAddingCat(!addingCat)}
                        className="text-[9px] uppercase tracking-[0.3em] text-[#404040] border-b border-[#303030] pb-1 hover:text-[#FDFBF7] transition-colors"
                    >
                        + Add Category
                    </button>
                    <button
                        onClick={handleSave}
                        className={`text-[9px] uppercase tracking-[0.3em] border-b pb-1 transition-colors ${saved ? 'text-emerald-400 border-emerald-400/40' : 'text-[#C5A059] border-[#C5A059]/40 hover:text-[#FDFBF7] hover:border-[#FDFBF7]/40'}`}
                    >
                        {saved ? '✓ Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* ─── Add New Category Form ─── */}
            {addingCat && (
                <div className="border border-[#C5A059]/20 bg-[#060606] p-6 space-y-4">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#C5A059] mb-4">New Service Category</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-[0.2em] text-[#404040] block mb-1">Category Name *</label>
                            <input
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                placeholder="e.g. Ghana Weave"
                                className="w-full bg-transparent border-b border-[#333] py-1.5 text-xs text-[#FDFBF7] focus:border-[#C5A059] outline-none transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-[0.2em] text-[#404040] block mb-1">Description</label>
                            <input
                                value={newCatDesc}
                                onChange={e => setNewCatDesc(e.target.value)}
                                placeholder="Short description..."
                                className="w-full bg-transparent border-b border-[#333] py-1.5 text-xs text-[#606060] focus:border-[#C5A059] outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={addCategory}
                            className="text-[9px] uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/40 pb-1 hover:text-[#FDFBF7] transition-colors"
                        >
                            Create Category
                        </button>
                        <button
                            onClick={() => setAddingCat(false)}
                            className="text-[9px] uppercase tracking-widest text-[#404040] hover:text-[#606060] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Service Categories ─── */}
            <div className="space-y-4">
                {services.map((svc, si) => (
                    <div key={svc.id} className="border border-[#141414] bg-[#060606]">

                        {/* Category Header */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-b border-[#141414]">
                            <span className="text-[8px] sm:text-[9px] font-mono text-[#404040] w-5 shrink-0">0{si + 1}</span>
                            <input
                                value={svc.name}
                                onChange={e => updateCat(si, 'name', e.target.value)}
                                className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm font-serif text-[#FDFBF7] focus:outline-none border-b border-transparent focus:border-[#333] py-0.5 transition-colors"
                            />
                            <input
                                value={svc.description}
                                onChange={e => updateCat(si, 'description', e.target.value)}
                                placeholder="Desc..."
                                className="hidden sm:flex flex-1 min-w-0 bg-transparent text-[10px] text-[#404040] focus:outline-none border-b border-transparent focus:border-[#333] py-0.5 transition-colors"
                            />
                            <button
                                onClick={() => removeCat(si)}
                                className="text-[7px] sm:text-[8px] uppercase tracking-widest text-[#303030] hover:text-red-500/80 transition-colors ml-auto shrink-0"
                            >
                                Delete
                            </button>
                        </div>

                        {/* Size Variants */}
                        {svc.sizes.map((sz, zi) => (
                            <SizeRow key={sz.id} sz={sz} si={si} zi={zi} onUpdate={updateSize} onRemove={removeSize} />
                        ))}

                        {/* Add Size Button */}
                        <div className="px-6 py-3 border-t border-[#0E0E0E]">
                            <button
                                onClick={() => addSize(si)}
                                className="text-[8px] uppercase tracking-[0.25em] text-[#404040] hover:text-[#C5A059] transition-colors"
                            >
                                + Add Size Variant
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
