export type Lang = 'en' | 'km';

export interface Bilingual {
  en: string;
  km: string;
}

export interface Category {
  slug: string;
  name: Bilingual;
  description: Bilingual;
  icon: string;
}

export interface Article {
  id: string;
  slug: string;
  title: Bilingual;
  description: Bilingual;
  /** Rich-text HTML. Always sanitised before rendering. */
  content: Bilingual;
  categorySlug: string;
  tags: string[];
  authorName: string;
  authorBio: Bilingual;
  publishedAt: string; // ISO date
  featured: boolean;
  readMinutes: number;
  coverImageUrl: string | null;
  coverAlt: Bilingual;
  /** Code / standard references shown at the end of the article. */
  references: string[];
  seoTitle?: Bilingual;
  seoDescription?: Bilingual;
}

export type ResourceFormat = 'xlsx' | 'pdf' | 'docx' | 'dwg' | 'rvt' | 'zip' | 'other';

export interface Resource {
  id: string;
  slug: string;
  name: Bilingual;
  description: Bilingual;
  categorySlug: string;
  thumbnailUrl: string | null;
  format: ResourceFormat;
  /** Bytes. null until a real file is uploaded. */
  fileSizeBytes: number | null;
  version: string;
  publishedAt: string;
  isFree: boolean;
  downloadCount: number;
  /** Public file URL. null until a real file is uploaded. */
  fileUrl: string | null;
  featured: boolean;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}
