'use client';

import { useEffect, useState } from 'react';

export interface SiteSettings {
    heroTitle: string;
    heroSubtitle: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    tiktok: string;
}

const DEFAULTS: SiteSettings = {
    heroTitle: 'Luxury Hair Braiding Experience',
    heroSubtitle: 'Premium braiding services with liquid glass salon aesthetics',
    email: 'concierge@solange.maison',
    phone: '+1.800.555.0199',
    address: '',
    instagram: 'https://instagram.com/solangehair',
    tiktok: 'https://tiktok.com/@solangehair',
};

// Module-level cache so the fetch runs only once per page load across all consumers
let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

function fetchSettings(): Promise<SiteSettings> {
    if (fetchPromise) return fetchPromise;
    fetchPromise = fetch('/api/admin/siteSettings')
        .then((r) => r.json())
        .then((data) => {
            const d = data.settings || {};
            const s: SiteSettings = {
                heroTitle: d.heroTitle || DEFAULTS.heroTitle,
                heroSubtitle: d.heroSubtitle || DEFAULTS.heroSubtitle,
                email: d.email || DEFAULTS.email,
                phone: d.phone || DEFAULTS.phone,
                address: d.address || '',
                instagram: d.instagram || DEFAULTS.instagram,
                tiktok: d.tiktok || DEFAULTS.tiktok,
            };
            cachedSettings = s;
            return s;
        })
        .catch(() => {
            fetchPromise = null; // allow retry on error
            return DEFAULTS;
        });
    return fetchPromise;
}

export function useSiteSettings(): SiteSettings {
    const [settings, setSettings] = useState<SiteSettings>(cachedSettings ?? DEFAULTS);

    useEffect(() => {
        if (cachedSettings) {
            setSettings(cachedSettings);
            return;
        }
        fetchSettings().then(setSettings);
    }, []);

    return settings;
}
