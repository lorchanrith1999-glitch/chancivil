import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { getArticleCategories } from '../services/content';
import { formatDate } from '../lib/utils';
import type { Article } from '../types';

export default function ArticleCard({ article }: { article: Article }) {
  const { lang, pick, t } = useLanguage();
  const categories = useAsync(() => getArticleCategories(), []);
  const category = categories.data?.find((c) => c.slug === article.categorySlug);

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {article.coverImageUrl ? (
        <img
          src={article.coverImageUrl}
          alt={pick(article.coverAlt)}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-surface text-brand" aria-hidden="true">
          <CategoryIcon name={category?.icon ?? 'book'} className="h-10 w-10" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {category && <p className="eyebrow mb-2">{pick(category.name)}</p>}
        <h3 className="text-lg leading-snug">
          <Link to={`/articles/${article.slug}`} className="hover:text-brand">
            {pick(article.title)}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-slate-600">{pick(article.description)}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {article.readMinutes} {t('common.minRead')}
          </span>
        </div>
      </div>
    </article>
  );
}
