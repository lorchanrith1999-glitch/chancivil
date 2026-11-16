import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Facebook, Link2, Send } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import SampleNotice from '../components/SampleNotice';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { formatDate, prepareArticleHtml, siteUrl } from '../lib/utils';
import { getArticleBySlug, getArticleCategories, getRelatedArticles } from '../services/content';
import NotFound from './NotFound';

export default function ArticleDetail() {
  const { slug = '' } = useParams();
  const { lang, t, pick } = useLanguage();
  const [copied, setCopied] = useState(false);

  const article = useAsync(() => getArticleBySlug(slug), [slug]);
  const categories = useAsync(() => getArticleCategories(), []);
  const related = useAsync(
    async () => (article.data ? getRelatedArticles(article.data, 3) : []),
    [article.data],
  );

  const prepared = useMemo(
    () => (article.data ? prepareArticleHtml(pick(article.data.content)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [article.data, lang],
  );

  if (article.loading) {
    return <div className="container-page py-16 text-slate-500">{t('common.loading')}</div>;
  }
  if (article.error) {
    return <div className="container-page py-16 text-red-700">{t('common.error')}</div>;
  }
  if (!article.data || !prepared) return <NotFound article />;

  const a = article.data;
  const category = categories.data?.find((c) => c.slug === a.categorySlug);
  const path = `/articles/${a.slug}`;
  const url = `${siteUrl()}${path}`;
  const title = pick(a.title);
  const seoTitle = a.seoTitle ? pick(a.seoTitle) : title;
  const seoDescription = a.seoDescription ? pick(a.seoDescription) : pick(a.description);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={path}
        type="article"
        image={a.coverImageUrl}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: seoDescription,
          datePublished: a.publishedAt,
          author: { '@type': 'Organization', name: a.authorName },
          inLanguage: lang,
        }}
      />

      <div className="container-page py-10">
        <Link to="/articles" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.backToArticles')}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_16rem]">
          <article className="min-w-0">
            {category && <p className="eyebrow mb-2">{pick(category.name)}</p>}
            <h1 className="text-3xl sm:text-4xl">{title}</h1>
            <p className="mt-3 text-lg text-slate-600">{pick(a.description)}</p>
            <p className="mt-4 text-sm text-slate-500">
              {t('common.by')} {a.authorName} ·{' '}
              <time dateTime={a.publishedAt}>{formatDate(a.publishedAt, lang)}</time> · {a.readMinutes}{' '}
              {t('common.minRead')}
            </p>

            <div className="mt-6">
              <SampleNotice />
            </div>

            {a.coverImageUrl && (
              <img
                src={a.coverImageUrl}
                alt={pick(a.coverAlt)}
                loading="lazy"
                className="mt-6 aspect-[16/9] w-full rounded-lg object-cover"
              />
            )}

            {/* Content is sanitised with DOMPurify in prepareArticleHtml before rendering. */}
            <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: prepared.html }} />

            {a.references.length > 0 && (
              <section aria-labelledby="refs" className="mt-10 rounded-lg bg-surface p-5">
                <h2 id="refs" className="text-lg">{t('common.references')}</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {a.references.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-label={t('common.share')} className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-navy">{t('common.share')}:</span>
              <a
                className="btn-outline px-3 py-2"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              >
                <Facebook className="h-4 w-4" aria-hidden="true" /> Facebook
              </a>
              <a
                className="btn-outline px-3 py-2"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
              >
                <Send className="h-4 w-4" aria-hidden="true" /> Telegram
              </a>
              <button type="button" className="btn-outline px-3 py-2" onClick={copyLink}>
                <Link2 className="h-4 w-4" aria-hidden="true" />
                {copied ? t('common.copied') : t('common.copyLink')}
              </button>
            </section>

            <section aria-label="Author" className="mt-10 flex items-start gap-4 border-t border-slate-200 pt-6">
              <img src="/logo.svg" alt="" className="h-12 w-12 rounded-md" width={48} height={48} loading="lazy" />
              <div>
                <p className="font-semibold text-navy">{a.authorName}</p>
                <p className="text-sm text-slate-600">{pick(a.authorBio)}</p>
              </div>
            </section>
          </article>

          <aside className="order-first lg:order-none">
            {prepared.toc.length > 0 && (
              <nav aria-label={t('common.toc')} className="rounded-lg border border-slate-200 p-4 lg:sticky lg:top-24">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy">{t('common.toc')}</h2>
                <ol className="space-y-2 text-sm">
                  {prepared.toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                      <a href={`#${item.id}`} className="text-slate-700 hover:text-brand">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </aside>
        </div>

        {related.data && related.data.length > 0 && (
          <section aria-labelledby="related" className="mt-16">
            <h2 id="related" className="mb-6 text-2xl">{t('common.related')}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.data.map((r) => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
