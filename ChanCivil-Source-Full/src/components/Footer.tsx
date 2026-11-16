import { Link } from 'react-router-dom';
import Logo from './Logo';
import SocialLinks from './SocialLinks';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-20 bg-navy text-slate-300">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm">{t('footer.tagline')}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">{t('footer.explore')}</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/articles">{t('nav.articles')}</Link></li>
            <li><Link className="hover:text-white" to="/resources">{t('nav.resources')}</Link></li>
            <li><Link className="hover:text-white font-medium text-cyan-300" to="/tools">{t('nav.tools')} ✨</Link></li>
            <li><Link className="hover:text-white" to="/about">{t('nav.about')}</Link></li>
            <li><Link className="hover:text-white" to="/contact">{t('nav.contact')}</Link></li>
            <li className="pt-2"><Link className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 font-semibold" to="/admin">Admin Control ↗</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">{t('footer.connect')}</h2>
          <SocialLinks light />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page space-y-2 py-6 text-xs text-slate-400">
          <p><strong className="text-slate-200">{t('disclaimer.title')}.</strong> {t('disclaimer.text')}</p>
          <p>© {new Date().getFullYear()} ChanCivil. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
