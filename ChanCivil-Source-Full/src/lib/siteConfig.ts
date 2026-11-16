/**
 * Temporary site settings read from environment variables.
 * Phase 3 replaces this with values stored in the `website_settings` table
 * and editable from Admin -> Website Settings.
 */
export const siteConfig = {
  name: 'ChanCivil',
  facebookUrl: import.meta.env.VITE_FACEBOOK_URL ?? '',
  youtubeUrl: import.meta.env.VITE_YOUTUBE_URL ?? '',
  tiktokUrl: import.meta.env.VITE_TIKTOK_URL ?? '',
  telegramUrl: import.meta.env.VITE_TELEGRAM_URL ?? '',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? '',
};
