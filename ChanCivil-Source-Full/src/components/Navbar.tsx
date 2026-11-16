import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import type { TKey } from '../i18n/translations';

const links: { to: string; key: TKey; end?: boolean }[] = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/tools', key: 'nav.tools' },
  { to: '/articles', key: 'nav.articles' },
  { to: '/resources', key: 'nav.resources' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
];

function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const base = 'px-3 py-1.5 text-sm font-semibold transition-colors';
  return (
    <div role="group" aria-label={t('nav.language')} className="inline-flex overflow-hidden rounded-md border border-slate-300">
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        lang="en"
        className={`${base} ${lang === 'en' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-slate-100'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('km')}
        aria-pressed={lang === 'km'}
        lang="km"
        className={`${base} ${lang === 'km' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-slate-100'}`}
      >
        ខ្មែរ
      </button>
    </div>
  );
}

export default function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand' : 'text-slate-700 hover:text-brand'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/admin"
            className="hidden items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand sm:inline-flex"
            title="Admin Control"
          >
            Admin
          </NavLink>
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-navy md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('nav.close') : t('nav.menu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {t(l.key)}
              </NavLink>
            ))}
            <NavLink to="/admin" className={linkClass}>
              Admin Control
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
