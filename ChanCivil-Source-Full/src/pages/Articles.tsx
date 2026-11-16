import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import SampleNotice from '../components/SampleNotice';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { getArticleCategories, getArticles } from '../services/content';

export default function Articles() {
  const { t, pick } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const category = params.get('category') ?? 'all';

  const articles = useAsync(() => getArticles(), []);
  const categories = useAsync(() => getArticleCategories(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (articles.data ?? []).filter((a) => {
      if (category !== 'all' && a.categorySlug !== category) return false;
      if (!q) return true;
      const haystack = [
        a.title.en,
        a.title.km,
        a.description.en,
        a.description.km,
        a.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles.data, category, query]);

  function setCategory(slug: string) {
    if (slug === 'all') setParams({});
    else setParams({ category: slug });
  }

  return (
    <>
      <Seo title={t('articles.title')} description={t('articles.intro')} path="/articles" />
      <div className="container-page py-12">
        <h1 className="text-3xl sm:text-4xl">{t('articles.title')}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{t('articles.intro')}</p>

        <div className="mt-6">
          <SampleNotice />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="article-search" className="sr-only">
              {t('articles.searchPlaceholder')}
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="article-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('articles.searchPlaceholder')}
              className="input pl-9"
            />
          </div>
          <div>
            <label htmlFor="article-category" className="sr-only">
              {t('common.category')}
            </label>
            <select
              id="article-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input sm:w-64"
            >
              <option value="all">{t('common.all')}</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {pick(c.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8" aria-live="polite">
          {articles.loading && <p className="text-slate-500">{t('common.loading')}</p>}
          {articles.error && <p className="text-red-700">{t('common.error')}</p>}
          {!articles.loading && !articles.error && filtered.length === 0 && (
            <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-500">
              {t('common.noResults')}
            </p>
          )}
          {filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
