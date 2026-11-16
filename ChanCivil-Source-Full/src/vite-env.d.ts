/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_YOUTUBE_URL?: string;
  readonly VITE_TIKTOK_URL?: string;
  readonly VITE_TELEGRAM_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
