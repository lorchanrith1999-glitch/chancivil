import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, Target } from 'lucide-react';
import Seo from '../components/Seo';
import SocialLinks, { getSocialItems } from '../components/SocialLinks';
import { useLanguage } from '../contexts/LanguageContext';
import { siteConfig } from '../lib/siteConfig';
import type { TKey } from '../i18n/translations';

const values: { title: TKey; text: TKey }[] = [
  { title: 'about.value1Title', text: 'about.value1Text' },
  { title: 'about.value2Title', text: 'about.value2Text' },
  { title: 'about.value3Title', text: 'about.value3Text' },
  { title: 'about.value4Title', text: 'about.value4Text' },
];
const objectives: TKey[] = ['about.obj1', 'about.obj2', 'about.obj3', 'about.obj4'];

export default function About() {
  const { t } = useLanguage();
  return (
    <>
      <Seo title={t('about.title')} description={t('about.intro')} path="/about" />
      <div className="container-page py-12">
        <h1 className="text-3xl sm:text-4xl">{t('about.title')}</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-700">{t('about.intro')}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-lg bg-surface p-6">
            <Eye className="mb-3 h-6 w-6 text-brand" aria-hidden="true" />
            <h2 className="text-xl">{t('about.vision')}</h2>
            <p className="mt-2 text-slate-700">{t('about.visionText')}</p>
          </section>
          <section className="rounded-lg bg-surface p-6">
            <Target className="mb-3 h-6 w-6 text-brand" aria-hidden="true" />
            <h2 className="text-xl">{t('about.mission')}</h2>
            <p className="mt-2 text-slate-700">{t('about.missionText')}</p>
          </section>
        </div>

        <section className="mt-12" aria-labelledby="values">
          <h2 id="values" className="text-2xl">{t('about.values')}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="card p-5">
                <h3 className="text-lg">{t(v.title)}</h3>
                <p className="mt-2 text-sm text-slate-600">{t(v.text)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="objectives">
          <h2 id="objectives" className="text-2xl">{t('about.objectives')}</h2>
          <ul className="mt-6 space-y-3">
            {objectives.map((o) => (
              <li key={o} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                <span>{t(o)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-lg border border-slate-200 p-6" aria-labelledby="about-contact">
          <h2 id="about-contact" className="text-2xl">{t('about.contactTitle')}</h2>
          <p className="mt-3">
            {t('contact.emailLabel')}:{' '}
            {siteConfig.contactEmail ? (
              <a className="text-brand underline" href={`mailto:${siteConfig.contactEmail}`}>
                {siteConfig.contactEmail}
              </a>
            ) : (
              <span className="text-slate-500">{t('contact.emailPlaceholder')}</span>
            )}
          </p>
          <div className="mt-4">
            {getSocialItems().length > 0 ? <SocialLinks /> : <p className="text-sm text-slate-500">{t('contact.notConfigured')}</p>}
          </div>
          <Link to="/contact" className="btn-primary mt-5">
            {t('nav.contact')}
          </Link>
        </section>
      </div>
    </>
  );
}
