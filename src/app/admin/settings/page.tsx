'use client';

import { useEffect, useRef, useState } from 'react';

type MediaItem = { id: string; label: string; url: string; type: 'video' | 'image' };

type Settings = {
    heroTitle: string;
    heroSubtitle: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    tiktok: string;
    media: MediaItem[];
};

const DEFAULTS: Settings = {
    heroTitle: 'Luxury Hair Braiding Experience',
    heroSubtitle: 'Premium braiding services with liquid glass salon aesthetics',
    email: 'concierge@solange.maison',
    phone: '+1.800.555.0199',
    address: '',
    instagram: 'https://instagram.com/solangehair',
    tiktok: 'https://tiktok.com/@solangehair',
    media: [
        { id: 'hero-v1', label: 'Hero Video 1', url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-with-beautiful-braided-hair-41712-large.mp4', type: 'video' },
        { id: 'hero-v2', label: 'Hero Video 2', url: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-with-long-braids-posing-41706-large.mp4', type: 'video' },
        { id: 'hero-v3', label: 'Hero Video 3', url: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-combing-hair-of-a-woman-in-a-salon-4048-large.mp4', type: 'video' },
        { id: 'hero-bg', label: 'Hero Fallback Image', url: 'https://images.unsplash.com/photo-1595476108018-0e817c1bf194?auto=format&fit=crop&q=80&w=2000', type: 'image' },
        { id: 'about-v1', label: 'About Page Video', url: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-combing-hair-of-a-woman-in-a-salon-4048-large.mp4', type: 'video' },
    ],
};

function genId() { return 'media-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

// ─── Upload helper: converts File → data URL, sends to /api/admin/upload ──
async function uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, dataUrl: reader.result }),
                });

                // Read as text first — if the server returned a non-JSON body
                // (e.g. "Request Entity Too Large") we still get a clean error.
                const text = await res.text();
                let data: any;
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
                }

                if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
                resolve(data.url);
            } catch (e: any) { reject(e); }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export default function AdminSettingsPage() {
    const [s, setS] = useState<Settings>(DEFAULTS);
    const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
    const [errMsg, setErrMsg] = useState('');
    const [addingMedia, setAddingMedia] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newType, setNewType] = useState<'video' | 'image'>('video');
    const [uploading, setUploading] = useState<string | null>(null); // media id being uploaded
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // ─── Load settings from DB ─────────────────────────────────────────
    useEffect(() => {
        fetch('/api/admin/siteSettings')
            .then(r => r.json())
            .then(data => {
                if (data.settings) {
                    const d = data.settings;
                    let mergedMedia = (d.media && d.media.length > 0) ? d.media : DEFAULTS.media;
                    if (!mergedMedia.find((m: MediaItem) => m.id === 'about-v1')) {
                        mergedMedia = [...mergedMedia, DEFAULTS.media.find(m => m.id === 'about-v1')!];
                    }
                    setS({
                        heroTitle: d.heroTitle || DEFAULTS.heroTitle,
                        heroSubtitle: d.heroSubtitle || DEFAULTS.heroSubtitle,
                        email: d.email || DEFAULTS.email,
                        phone: d.phone || DEFAULTS.phone,
                        address: d.address || '',
                        instagram: d.instagram || DEFAULTS.instagram,
                        tiktok: d.tiktok || DEFAULTS.tiktok,
                        media: mergedMedia,
                    });
                }
                setStatus('idle');
            })
            .catch(() => setStatus('idle'));
    }, []);

    // ─── Save to DB ────────────────────────────────────────────────────
    const handleSave = async () => {
        setStatus('saving');
        try {
            const res = await fetch('/api/admin/siteSettings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(s),
            });
            if (!res.ok) throw new Error('Save failed');
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (e: any) {
            setErrMsg(e.message);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    // ─── Upload a file — then auto-save so upload is never lost ────────
    const handleFileUpload = async (mediaId: string, file: File) => {
        setUploading(mediaId);
        try {
            const url = await uploadFile(file);
            // Update state and immediately persist
            setS(prev => {
                const updated = {
                    ...prev,
                    media: prev.media.map(m => m.id === mediaId ? { ...m, url } : m),
                };
                // Auto-save the updated settings
                fetch('/api/admin/siteSettings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                }).catch(console.error);
                return updated;
            });
        } catch (e: any) {
            alert('Upload failed: ' + e.message);
        } finally {
            setUploading(null);
        }
    };

    const updateMedia = (id: string, url: string) =>
        setS(prev => ({ ...prev, media: prev.media.map(m => m.id === id ? { ...m, url } : m) }));

    const removeMedia = (id: string) =>
        setS(prev => ({ ...prev, media: prev.media.filter(m => m.id !== id) }));

    const addMedia = () => {
        if (!newLabel.trim()) return;
        setS(prev => ({ ...prev, media: [...prev.media, { id: genId(), label: newLabel.trim(), url: newUrl.trim(), type: newType }] }));
        setNewLabel(''); setNewUrl(''); setAddingMedia(false);
    };

    const set = (k: keyof Settings, v: string) => setS(prev => ({ ...prev, [k]: v }));

    // ─── Helpers ────────────────────────────────────────────────────────
    const saveLabel = status === 'saving' ? 'Saving...' : status === 'saved' ? '✓ Saved to Database' : status === 'error' ? errMsg : 'Save Changes';
    const saveCls = status === 'saved' ? 'text-emerald-400 border-emerald-400/40' : status === 'error' ? 'text-red-500 border-red-500/40' : 'text-[#C5A059] border-[#C5A059]/40 hover:text-[#FDFBF7] hover:border-[#FDFBF7]/40';

    if (status === 'loading') return (
        <div className="py-20 text-center text-[9px] uppercase tracking-widest text-[#404040] animate-pulse">Loading configuration...</div>
    );

    const Field = ({ label, value, onChange, type = 'text', multi = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; multi?: boolean }) => (
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-4 border-b border-[#0E0E0E] last:border-0">
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#404040] w-32 shrink-0 pt-1">{label}</span>
            {multi ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
                    className="flex-1 bg-transparent border-b border-[#222] py-1 text-xs text-[#FDFBF7] focus:border-[#C5A059] outline-none resize-none transition-colors" />
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-transparent border-b border-[#222] py-1 text-xs text-[#FDFBF7] focus:border-[#C5A059] outline-none transition-colors" />
            )}
        </div>
    );

    const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="border border-[#141414] bg-[#060606]">
            <div className="px-6 py-4 border-b border-[#141414]">
                <span className="text-[8px] uppercase tracking-[0.4em] text-[#404040]">{label}</span>
            </div>
            <div className="px-6">{children}</div>
        </div>
    );

    return (
        <div className="max-w-3xl space-y-10">

            {/* ─── Header ─── */}
            <div className="border-b border-[#141414] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#404040] mb-3">System</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#FDFBF7] tracking-tight leading-none">Settings</h1>
                </div>
                <button onClick={handleSave} disabled={status === 'saving'}
                    className={`text-[9px] uppercase tracking-[0.3em] border-b pb-1 transition-colors disabled:opacity-50 ${saveCls}`}>
                    {saveLabel}
                </button>
            </div>

            {/* ─── Hero Section ─── */}
            <Section label="Hero Section">
                <Field label="Headline" value={s.heroTitle} onChange={v => set('heroTitle', v)} />
                <Field label="Subheading" value={s.heroSubtitle} onChange={v => set('heroSubtitle', v)} multi />
            </Section>

            {/* ─── Media Library ─── */}
            <div className="border border-[#141414] bg-[#060606]">
                <div className="px-6 py-4 border-b border-[#141414] flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-[#404040]">Media Library</span>
                    <button onClick={() => setAddingMedia(!addingMedia)}
                        className="text-[8px] uppercase tracking-[0.25em] text-[#404040] hover:text-[#C5A059] transition-colors">
                        + Add Slot
                    </button>
                </div>

                {/* Add form */}
                {addingMedia && (
                    <div className="px-6 py-4 bg-[#070707] border-b border-[#141414] space-y-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[8px] uppercase tracking-[0.2em] text-[#404040] block mb-1">Label *</label>
                                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Hero Video 4"
                                    className="w-full bg-transparent border-b border-[#333] py-1 text-xs text-[#FDFBF7] focus:border-[#C5A059] outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-[8px] uppercase tracking-[0.2em] text-[#404040] block mb-1">URL (optional, can upload after)</label>
                                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..."
                                    className="w-full bg-transparent border-b border-[#333] py-1 text-xs text-[#606060] focus:border-[#C5A059] outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex gap-4">
                                {(['video', 'image'] as const).map(t => (
                                    <label key={t} onClick={() => setNewType(t)} className="flex items-center gap-2 cursor-pointer">
                                        <span className={`w-3 h-3 border flex items-center justify-center transition ${newType === t ? 'border-[#C5A059] bg-[#C5A059]/20' : 'border-[#333]'}`}>
                                            {newType === t && <span className="text-[#C5A059] text-[6px]">✓</span>}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-widest text-[#404040]">{t}</span>
                                    </label>
                                ))}
                            </div>
                            <button onClick={addMedia} className="text-[8px] uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/30 pb-0.5 hover:text-[#FDFBF7] transition-colors ml-auto">Add</button>
                            <button onClick={() => setAddingMedia(false)} className="text-[8px] uppercase tracking-widest text-[#404040]">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Media rows */}
                <div className="divide-y divide-[#0E0E0E]">
                    {s.media.map(m => (
                        <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 group hover:bg-[#080808] transition-colors">

                            {/* Type badge */}
                            <span className={`text-[7px] uppercase tracking-[0.2em] px-2 py-1 border flex-shrink-0 ${m.type === 'video' ? 'text-[#C5A059] border-[#C5A059]/20' : 'text-blue-400 border-blue-400/20'}`}>
                                {m.type}
                            </span>

                            {/* Label */}
                            <span className="text-[9px] uppercase tracking-widest text-[#505050] w-36 shrink-0">{m.label}</span>

                            {/* URL input */}
                            <input
                                value={m.url}
                                onChange={e => updateMedia(m.id, e.target.value)}
                                placeholder="Paste URL or upload below..."
                                className="flex-1 bg-transparent border-b border-[#1A1A1A] hover:border-[#333] focus:border-[#C5A059] py-1 text-[10px] text-[#404040] focus:text-[#FDFBF7] outline-none transition-colors font-mono min-w-0"
                            />

                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept={m.type === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
                                className="hidden"
                                ref={el => { fileRefs.current[m.id] = el; }}
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(m.id, f); }}
                            />

                            {/* Upload btn */}
                            <button
                                onClick={() => fileRefs.current[m.id]?.click()}
                                disabled={uploading === m.id}
                                className="text-[7px] uppercase tracking-widest text-[#303030] hover:text-[#C5A059] border border-[#222] hover:border-[#C5A059]/30 px-2 py-1 transition-all flex-shrink-0 disabled:animate-pulse"
                            >
                                {uploading === m.id ? 'Uploading...' : '↑ Upload'}
                            </button>

                            {/* Preview */}
                            {m.url && (
                                <a href={m.url} target="_blank" rel="noopener noreferrer"
                                    className="text-[7px] text-[#303030] hover:text-[#C5A059] transition-colors flex-shrink-0">↗</a>
                            )}

                            {/* Remove */}
                            <button onClick={() => removeMedia(m.id)}
                                className="text-[7px] uppercase tracking-widest text-[#303030] hover:text-red-500/80 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Contact ─── */}
            <Section label="Contact Details">
                <Field label="Email" value={s.email} onChange={v => set('email', v)} type="email" />
                <Field label="Phone" value={s.phone} onChange={v => set('phone', v)} />
                <Field label="Address" value={s.address} onChange={v => set('address', v)} multi />
            </Section>

            {/* ─── Social ─── */}
            <Section label="Social Media">
                <Field label="Instagram" value={s.instagram} onChange={v => set('instagram', v)} />
                <Field label="TikTok" value={s.tiktok} onChange={v => set('tiktok', v)} />
            </Section>

            {/* ─── Danger Zone ─── */}
            <div className="border border-red-900/20 bg-[#060606]">
                <div className="px-6 py-4 border-b border-red-900/20">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-red-600/60">Danger Zone</span>
                </div>
                <div className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                    <p className="text-[9px] text-[#404040] leading-relaxed max-w-sm">
                        Permanently purge all test and seed data from the database.
                    </p>
                    <button className="text-[8px] uppercase tracking-[0.2em] text-red-600/60 border-b border-red-600/20 pb-1 hover:text-red-500 transition-colors whitespace-nowrap">
                        Purge Test Data
                    </button>
                </div>
            </div>
        </div>
    );
}
