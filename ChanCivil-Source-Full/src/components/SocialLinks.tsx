import { Facebook, Music2, Send, Youtube, type LucideIcon } from 'lucide-react';
import { siteConfig } from '../lib/siteConfig';

interface SocialItem {
  label: string;
  url: string;
  Icon: LucideIcon;
}

export function getSocialItems(): SocialItem[] {
  return [
    { label: 'Facebook', url: siteConfig.facebookUrl, Icon: Facebook },
    { label: 'YouTube', url: siteConfig.youtubeUrl, Icon: Youtube },
    { label: 'TikTok', url: siteConfig.tiktokUrl, Icon: Music2 },
    { label: 'Telegram', url: siteConfig.telegramUrl, Icon: Send },
  ].filter((item) => item.url.length > 0);
}

/** Renders only the social links that have been configured. */
export default function SocialLinks({ light = false }: { light?: boolean }) {
  const items = getSocialItems();
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ label, url, Icon }) => (
        <li key={label}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${
              light
                ? 'border-white/25 text-white hover:bg-white/10'
                : 'border-slate-300 text-navy hover:border-brand hover:text-brand'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
