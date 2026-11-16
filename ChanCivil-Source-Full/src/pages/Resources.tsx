import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import SampleNotice from '../components/SampleNotice';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { getResourceCategories, getResources } from '../services/content';

type PriceFilter = 'all' | 'free' | 'paid';

export default function Resources() {
  const { t, pick } = useLanguage();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [price, setPrice] = useState<PriceFilter>('all');

  const resources = useAsync(() => getResources(), []);
  const categories = useAsync(() => getResourceCategories(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (resources.data ?? []).filter((r) => {
      if (category !== 'all' && r.categorySlug !== category) return false;
      if (price === 'free' && !r.isFree) return false;
      if (price === 'paid' && r.isFree) return false;
      if (!q) return true;
      return [r.name.en, r.name.km, r.description.en, r.description.km].join(' ').toLowerCase().includes(q);
    });
  }, [resources.data, category, price, query]);

  return (
    <>
      <Seo title={t('resources.title')} description={t('resources.intro')} path="/resources" />
      <div className="container-page py-12">
        <h1 className="text-3xl sm:text-4xl">{t('resources.title')}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{t('resources.intro')}</p>

        <div className="mt-6">
          <SampleNotice />
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_16rem_10rem]">
          <div className="relative">
            <label htmlFor="resource-search" className="sr-only">
              {t('resources.searchPlaceholder')}
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="resource-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('resources.searchPlaceholder')}
              className="input pl-9"
            />
          </div>
          <div>
            <label htmlFor="resource-category" className="sr-only">
              {t('common.category')}
            </label>
            <select id="resource-category" value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              <option value="all">{t('common.all')}</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {pick(c.name)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resource-price" className="sr-only">
              {t('common.price')}
            </label>
            <select id="resource-price" value={price} onChange={(e) => setPrice(e.target.value as PriceFilter)} className="input">
              <option value="all">{t('common.all')}</option>
              <option value="free">{t('common.free')}</option>
              <option value="paid">{t('common.paid')}</option>
            </select>
          </div>
        </div>

        <div className="mt-8" aria-live="polite">
          {resources.loading && <p className="text-slate-500">{t('common.loading')}</p>}
          {resources.error && <p className="text-red-700">{t('common.error')}</p>}
          {!resources.loading && !resources.error && filtered.length === 0 && (
            <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-500">
              {t('common.noResults')}
            </p>
          )}
          {filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
