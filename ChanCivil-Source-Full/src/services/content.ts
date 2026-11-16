import { articleCategories, resourceCategories } from '../data/categories';
import { sampleArticles } from '../data/articles';
import { sampleResources } from '../data/resources';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { isValidEmail } from '../lib/utils';
import type { Article, Category, Lang, Resource } from '../types';

/** The public site uses live Supabase content whenever the project is configured. */
export const contentSource: 'sample' | 'database' = isSupabaseConfigured ? 'database' : 'sample';

const byDateDesc = <T extends { publishedAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const categoryFromRow = (row: any): Category => ({
  slug: row.slug,
  name: { en: row.name_en ?? '', km: row.name_km ?? '' },
  description: { en: row.description_en ?? '', km: row.description_km ?? '' },
  icon: row.icon ?? 'book',
});

const publicImageUrl = (path: string | null | undefined): string | null => {
  if (!path || !supabase) return null;
  return supabase.storage.from('public-media').getPublicUrl(path).data.publicUrl;
};

const articleFromRow = (row: any): Article => {
  const categoryRow = row.article_categories?.[0]?.categories ?? row.category ?? null;
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en ?? '', km: row.title_km ?? '' },
    description: { en: row.description_en ?? '', km: row.description_km ?? '' },
    content: { en: row.content_en ?? '', km: row.content_km ?? '' },
    categorySlug: categoryRow?.slug ?? '',
    tags: (row.article_tags ?? []).map((item: any) => item.tags?.name_en).filter(Boolean),
    authorName: row.profiles?.display_name || 'ChanCivil',
    authorBio: { en: 'Civil and structural engineering knowledge shared by ChanCivil.', km: 'ចំណេះដឹងវិស្វកម្មសំណង់ស៊ីវិល និងរចនាសម្ព័ន្ធ ចែករំលែកដោយ ChanCivil។' },
    publishedAt: row.published_at ?? row.created_at,
    featured: Boolean(row.featured),
    readMinutes: row.read_minutes ?? 5,
    coverImageUrl: publicImageUrl(row.cover_image_path),
    coverAlt: { en: row.cover_alt_en ?? '', km: row.cover_alt_km ?? '' },
    references: row.code_references ?? [],
    seoTitle: row.seo_title_en || row.seo_title_km ? { en: row.seo_title_en ?? '', km: row.seo_title_km ?? '' } : undefined,
    seoDescription: row.seo_description_en || row.seo_description_km ? { en: row.seo_description_en ?? '', km: row.seo_description_km ?? '' } : undefined,
  };
};

const articleSelect = '*, article_categories(category_id, categories(*)), article_tags(tags(name_en)), profiles(display_name)';

export async function getArticleCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) return articleCategories;
  const { data, error } = await supabase.from('categories').select('*').eq('kind', 'article').order('sort_order');
  if (error) throw error;
  return (data ?? []).map(categoryFromRow);
}

export async function getResourceCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) return resourceCategories;
  const { data, error } = await supabase.from('categories').select('*').eq('kind', 'resource').order('sort_order');
  if (error) throw error;
  return (data ?? []).map(categoryFromRow);
}

export async function getArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) return byDateDesc(sampleArticles);
  const { data, error } = await supabase.from('articles').select(articleSelect).eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(articleFromRow);
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) return byDateDesc(sampleArticles.filter((a) => a.featured)).slice(0, limit);
  const { data, error } = await supabase.from('articles').select(articleSelect).eq('status', 'published').eq('featured', true).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map(articleFromRow);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured || !supabase) return sampleArticles.find((a) => a.slug === slug) ?? null;
  const { data, error } = await supabase.from('articles').select(articleSelect).eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle();
  if (error) throw error;
  return data ? articleFromRow(data) : null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const all = await getArticles();
  const sameCategory = all.filter((a) => a.id !== article.id && a.categorySlug === article.categorySlug);
  const others = all.filter((a) => a.id !== article.id && a.categorySlug !== article.categorySlug);
  return [...sameCategory, ...others].slice(0, limit);
}

const resourceFromRow = async (row: any): Promise<Resource> => {
  let fileUrl: string | null = null;
  if (row.is_free && row.file_path && supabase) {
    const { data } = await supabase.storage.from('resource-files').createSignedUrl(row.file_path, 60 * 10);
    fileUrl = data?.signedUrl ?? null;
  }
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en ?? '', km: row.name_km ?? '' },
    description: { en: row.description_en ?? '', km: row.description_km ?? '' },
    categorySlug: row.categories?.slug ?? '',
    thumbnailUrl: publicImageUrl(row.thumbnail_path),
    format: row.file_format ?? 'other',
    fileSizeBytes: row.file_size_bytes ?? null,
    version: row.version ?? '1.0',
    publishedAt: row.published_at ?? row.created_at,
    isFree: Boolean(row.is_free),
    downloadCount: row.download_count ?? 0,
    fileUrl,
    featured: Boolean(row.featured),
  };
};

export async function getResources(): Promise<Resource[]> {
  if (!isSupabaseConfigured || !supabase) return byDateDesc(sampleResources);
  const { data, error } = await supabase.from('resources').select('*, categories(slug)').eq('status', 'published').order('published_at', { ascending: false });
  if (error) throw error;
  return byDateDesc(await Promise.all((data ?? []).map(resourceFromRow)));
}

export async function getFeaturedResources(limit = 3): Promise<Resource[]> {
  if (!isSupabaseConfigured || !supabase) return byDateDesc(sampleResources.filter((r) => r.featured)).slice(0, limit);
  const { data, error } = await supabase.from('resources').select('*, categories(slug)').eq('status', 'published').eq('featured', true).order('published_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return byDateDesc(await Promise.all((data ?? []).map(resourceFromRow)));
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'invalid' | 'error' };

export async function subscribeToNewsletter(email: string, lang: Lang): Promise<SubmitResult> {
  const clean = email.trim().toLowerCase();
  if (!isValidEmail(clean)) return { ok: false, reason: 'invalid' };
  if (!isSupabaseConfigured || !supabase) return { ok: false, reason: 'not_configured' };
  const { error } = await supabase.from('subscribers').insert({ email: clean, language: lang });
  if (error && error.code !== '23505') return { ok: false, reason: 'error' };
  return { ok: true };
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

export async function submitContactMessage(payload: ContactPayload): Promise<SubmitResult> {
  if (payload.website.trim().length > 0) return { ok: true };
  if (payload.name.trim().length < 2 || payload.name.length > 100 || !isValidEmail(payload.email) || payload.message.trim().length < 10 || payload.message.length > 5000) {
    return { ok: false, reason: 'invalid' };
  }
  if (!isSupabaseConfigured || !supabase) return { ok: false, reason: 'not_configured' };
  const { error } = await supabase.from('contact_messages').insert({ name: payload.name.trim(), email: payload.email.trim(), subject: payload.subject.trim().slice(0, 200) || null, message: payload.message.trim() });
  if (error) return { ok: false, reason: 'error' };
  return { ok: true };
}
