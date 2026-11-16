import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { siteConfig as defaults } from '../lib/siteConfig';

export type SiteSettings = typeof defaults;
const SiteSettingsContext = createContext<SiteSettings>(defaults);
const keys: Record<string, keyof SiteSettings> = {
  contact_email: 'contactEmail', facebook_url: 'facebookUrl', youtube_url: 'youtubeUrl',
  tiktok_url: 'tiktokUrl', telegram_url: 'telegramUrl',
};
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    const load = async () => {
      const { data, error } = await client.from('website_settings').select('key,value');
      if (!active || error || !data) return;
      const next = { ...defaults };
      data.forEach(row => {
        const property = keys[row.key];
        if (property) (next as any)[property] = typeof row.value === 'string' ? row.value : String(row.value ?? '');
      });
      setSettings(next);
    };
    void load();
    window.addEventListener('chancivil-settings-updated', load);
    return () => { active = false; window.removeEventListener('chancivil-settings-updated', load); };
  }, []);
  const value = useMemo(() => settings, [settings]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}
export function useSiteSettings() { return useContext(SiteSettingsContext); }
