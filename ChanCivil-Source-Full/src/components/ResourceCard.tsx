import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { getResourceCategories } from '../services/content';
import { formatFileSize } from '../lib/utils';
import type { Resource } from '../types';

export default function ResourceCard({ resource }: { resource: Resource }) {
  const { pick, t } = useLanguage();
  const categories = useAsync(() => getResourceCategories(), []);
  const category = categories.data?.find((c) => c.slug === resource.categorySlug);
  const Icon = resource.format === 'xlsx' ? FileSpreadsheet : FileText;
  const size = formatFileSize(resource.fileSizeBytes);
  const canDownload = resource.isFree && resource.fileUrl !== null;

  return (
    <article className="card flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            resource.isFree ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
          }`}
        >
          {resource.isFree ? t('common.free') : t('common.paid')}
        </span>
      </div>

      {category && <p className="eyebrow mb-1">{pick(category.name)}</p>}
      <h3 className="text-lg leading-snug">{pick(resource.name)}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{pick(resource.description)}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
        <div>
          <dt className="font-semibold text-slate-700">{t('resources.format')}</dt>
          <dd className="uppercase">{resource.format}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">{t('resources.version')}</dt>
          <dd>{resource.version}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">{t('resources.size')}</dt>
          <dd>{size ?? '—'}</dd>
        </div>
      </dl>

      <div className="mt-5">
        {canDownload ? (
          <a href={resource.fileUrl as string} download className="btn-primary w-full">
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('common.download')}
          </a>
        ) : (
          <>
            <button type="button" disabled className="btn-outline w-full">
              <Download className="h-4 w-4" aria-hidden="true" />
              {resource.isFree ? t('resources.fileNotAvailable') : t('resources.paidUnavailable')}
            </button>
            {!resource.isFree && <p className="mt-2 text-xs text-slate-500">{t('resources.paidNotice')}</p>}
          </>
        )}
      </div>
    </article>
  );
}
