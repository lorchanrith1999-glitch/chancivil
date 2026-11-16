import DOMPurify from 'dompurify';
import type { Lang, TocItem } from '../types';

export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatFileSize(bytes: number | null): string | null {
  if (bytes === null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL;
  const base = configured && configured.length > 0 ? configured : window.location.origin;
  return base.replace(/\/$/, '');
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) && value.length <= 254;
}

/**
 * Sanitises rich-text HTML (never render editor/database HTML without this),
 * makes sure h2/h3 headings have ids, and returns a table of contents.
 */
export function prepareArticleHtml(rawHtml: string): { html: string; toc: TocItem[] } {
  const clean = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html');
  const toc: TocItem[] = [];
  doc.querySelectorAll('h2, h3').forEach((heading, index) => {
    const id = heading.id || `section-${index + 1}`;
    heading.id = id;
    toc.push({
      id,
      text: heading.textContent?.trim() ?? '',
      level: heading.tagName === 'H2' ? 2 : 3,
    });
  });
  return { html: doc.body.firstElementChild?.innerHTML ?? clean, toc };
}
