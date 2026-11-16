import { Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { contentSource } from '../services/content';

/** Shown whenever the page is displaying bundled sample content instead of database content. */
export default function SampleNotice() {
  const { t } = useLanguage();
  if (contentSource !== 'sample') return null;
  return (
    <p role="note" className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t('common.sampleNotice')}</span>
    </p>
  );
}
