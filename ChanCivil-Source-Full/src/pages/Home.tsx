import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Layers3,
  Ruler,
  ShieldCheck,
  Workflow,
  Sparkles
} from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import NewsletterForm from '../components/NewsletterForm';
import ResourceCard from '../components/ResourceCard';
import SampleNotice from '../components/SampleNotice';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import SocialLinks, { getSocialItems } from '../components/SocialLinks';
import InteractiveBeamSimulator from '../components/InteractiveBeamSimulator';
import QuickBoQCalculator from '../components/QuickBoQCalculator';
import BimWorkflowShowcase from '../components/BimWorkflowShowcase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { getFeaturedArticles, getFeaturedResources } from '../services/content';

const disciplines = [
  {
    icon: Ruler,
    title: 'Structural Design',
    kh: 'ការរចនារចនាសម្ព័ន្ធ',
    desc: 'RC and steel member design, foundations, detailing and ACI 318 code checks.',
    khDesc: 'ការរចនាបេតុងអាមេ និងដែក គ្រឹះ ការរៀបចំដែក និងការត្រួតពិនិត្យការរចនា។',
    tag: 'ACI 318 · AISC',
  },
  {
    icon: Workflow,
    title: 'Structural Analysis',
    kh: 'ការវិភាគរចនាសម្ព័ន្ធ',
    desc: 'Practical workflows for ETABS, SAFE, SAP2000 and finite element models.',
    khDesc: 'ដំណើរការប្រើប្រាស់ ETABS, SAFE, SAP2000 និងម៉ូដែលវិស្វកម្ម។',
    tag: 'ETABS · SAFE · SAP2000',
  },
  {
    icon: Boxes,
    title: 'BIM & Digital Construction',
    kh: 'BIM និងសំណង់ឌីជីថល',
    desc: 'CAD-to-BIM modeling, Revit coordination, Bar Bending Schedules and BoQ.',
    khDesc: 'Revit ការសម្របសម្រួលម៉ូដែល ការគណនាបរិមាណ និងការគ្រប់គ្រងគម្រោងឌីជីថល។',
    tag: 'Revit · AutoCAD · BBS',
  },
  {
    icon: FileSpreadsheet,
    title: 'Engineering Tools',
    kh: 'ឧបករណ៍ និងម៉ាស៊ីនគណនា',
    desc: 'Live beam flexure checkers, quantity takeoff spreadsheets and unit converters.',
    khDesc: 'សន្លឹកគណនា គំរូរចនា បញ្ជីត្រួតពិនិត្យ និងម៉ាស៊ីនគណនាបច្ចេកទេស។',
    tag: 'Calculators · Excel',
  },
];

const capabilities = [
  {
    icon: Calculator,
    title: 'Interactive Calculators',
    desc: 'Real-time ACI 318-19 beam flexure, BoQ concrete and rebar estimator, and unit conversion.',
    link: '/tools',
    label: 'Launch tools suite',
  },
  {
    icon: GraduationCap,
    title: 'Practical Learning',
    desc: 'Step-by-step technical guides connecting structural theory with actual job site practice.',
    link: '/articles',
    label: 'Start learning',
  },
  {
    icon: BookOpen,
    title: 'Technical Library',
    desc: 'Downloadable design spreadsheets, calculation books, report templates and references.',
    link: '/resources',
    label: 'Browse library',
  },
];

export default function Home() {
  const { t, lang } = useLanguage();
  const articles = useAsync(() => getFeaturedArticles(3), []);
  const resources = useAsync(() => getFeaturedResources(3), []);
  const hasSocial = getSocialItems().length > 0;
  const km = lang === 'km';

  return (
    <>
      <Seo
        title="ChanCivil — Structural Engineering, BIM & Design Suite"
        description="Dynamic structural engineering platform: live ACI 318 beam solvers, automated BoQ estimators, BIM workflows, and practical engineering guides in English & Khmer."
        path="/"
      />

      {/* Hero Section with Interactive Beam Simulator */}
      <section className="cc-hero relative overflow-hidden bg-navy text-white">
        <div className="cc-hero-grid absolute inset-0 opacity-60 pointer-events-none" />
        <div className="cc-hero-glow absolute -right-24 -top-32 h-96 w-96 rounded-full bg-brand/30 blur-3xl pointer-events-none" />
        <div className="container-page relative grid items-center gap-10 py-12 md:grid-cols-[1.05fr_.95fr] md:py-20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wider text-cyan-200">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {km ? 'វេទិកាវិស្វកម្មរចនាសម្ព័ន្ធ និង BIM ទំនើប' : 'NEXT-GEN STRUCTURAL & BIM PLATFORM'}
            </div>
            <h1 className="max-w-2xl text-3xl font-bold leading-[1.15] !text-white sm:text-5xl lg:text-5xl">
              {km ? (
                <>
                  រចនាដោយចំណេះដឹង។<br />
                  <span className="text-cyan-300">សាងសង់ដោយទំនុកចិត្ត។</span>
                </>
              ) : (
                <>
                  Engineer with clarity.<br />
                  <span className="text-cyan-300">Build with confidence.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {km
                ? 'ឧបករណ៍គណនារចនាសម្ព័ន្ធបន្តផ្ទាល់ ដំណើរការ CAD-to-BIM និង BoQ ស្វ័យប្រវត្តិ ព្រមទាំងឯកសារបច្ចេកទេស និងមេរៀនអនុវត្តជាក់ស្តែង សម្រាប់វិស្វករ និងនិស្សិត។'
                : 'Interactive structural design tools, automated CAD-to-BIM & BoQ takeoff, and job-ready technical guides — inspired by modern construction-tech standards.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tools" className="btn-primary !rounded-xl !px-6 !py-3 font-bold shadow-lg shadow-cyan-500/20">
                <Calculator className="h-4 w-4" />
                {km ? 'សាកល្បងម៉ាស៊ីនគណនា' : 'Launch Live Calculators'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/resources" className="btn-outline-light !rounded-xl !px-5 !py-3">
                {km ? 'ធនធានបច្ចេកទេស' : 'Explore Library'}
              </Link>
              <Link to="/articles" className="btn-outline-light !rounded-xl !px-5 !py-3">
                {km ? 'អានអត្ថបទ' : 'Articles'}
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                {km ? 'ស្តង់ដារ ACI 318-19' : 'ACI 318-19 & AISC'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                {km ? 'BoQ ស្វ័យប្រវត្តិ' : 'Automated BoQ Takeoff'}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers3 className="h-4 w-4 text-cyan-400" />
                {km ? 'ភាសាខ្មែរ និងអង់គ្លេស' : 'Khmer & English'}
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive Simulator */}
          <div className="relative mx-auto w-full max-w-xl">
            <InteractiveBeamSimulator />
          </div>
        </div>
      </section>

      <div className="container-page space-y-20 py-14 md:py-20">
        <SampleNotice />

        {/* Disciplines Section */}
        <section>
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="eyebrow">{km ? 'ចំណេះដឹងតាមជំនាញ' : 'ENGINEERING DISCIPLINES'}</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              {km ? 'អ្វីដែលអ្នកអាចស្វែងរកនៅ ChanCivil' : 'Everything engineers need to move forward.'}
            </h2>
            <p className="mt-3 text-slate-600">
              {km
                ? 'រៀបចំចំណេះដឹង និងឧបករណ៍តាមការងារវិស្វកម្មជាក់ស្តែង។'
                : 'Explore focused engineering topics, workflows and tools organised around real project work.'}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.map(({ icon: Icon, title, kh: khTitle, desc, khDesc, tag }) => (
              <article
                key={title}
                className="cc-discipline-card group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-navy">{km ? khTitle : title}</h3>
                <p className="mt-2 min-h-[76px] text-sm leading-6 text-slate-600">
                  {km ? khDesc : desc}
                </p>
                <p className="mt-5 border-t border-slate-100 pt-4 text-[10px] font-bold tracking-widest text-brand">
                  {tag}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Quick BoQ & Material Takeoff Calculator Section */}
        <QuickBoQCalculator />

        {/* Next-Gen BIM & Digital Construction Showcase (CamboBIM inspired) */}
        <BimWorkflowShowcase />

        {/* Platform Capabilities */}
        <section className="cc-capabilities overflow-hidden rounded-3xl bg-surface p-7 md:p-10 border border-slate-200">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{km ? 'វេទិកា ChanCivil' : 'THE CHANCIVIL PLATFORM'}</p>
              <h2 className="mt-2 text-2xl sm:text-3xl">
                {km ? 'ចាប់ផ្តើមពីអ្វីដែលអ្នកត្រូវការ' : 'Learn. Calculate. Design. Improve.'}
              </h2>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:gap-3"
            >
              {km ? 'អំពី ChanCivil' : 'About ChanCivil'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, desc, link, label }, i) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{desc}</p>
                <Link
                  to={link}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-cyan-700"
                >
                  {label} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section>
          <SectionHeading
            title={km ? 'អត្ថបទបច្ចេកទេស' : 'Engineering insights'}
            intro={
              km
                ? 'ការពន្យល់ និងដំណោះស្រាយសម្រាប់ការងាររចនាសម្ព័ន្ធ និងសំណង់។'
                : 'Practical explanations, design checks and software workflows for day-to-day engineering.'
            }
            linkTo="/articles"
            linkLabel={t('home.viewAll')}
          />
          {articles.loading && <p className="text-slate-500">{t('common.loading')}</p>}
          {articles.error && <p className="text-red-700">{t('common.error')}</p>}
          {articles.data && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.data.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </section>

        {/* Tools Banner */}
        <section className="cc-tools-banner relative overflow-hidden rounded-3xl bg-navy p-8 text-white md:p-12 shadow-2xl">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5 pointer-events-none" />
          <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold tracking-[.2em] text-cyan-300">
                CHANCIVIL ENGINEERING SUITE
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold !text-white sm:text-3xl">
                {km
                  ? 'ឧបករណ៍គណនា និងឯកសារដែលជួយឱ្យការងាររចនាកាន់តែមានប្រសិទ្ធភាព'
                  : 'Practical tools for faster, better engineering decisions.'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                {km
                  ? 'ស្វែងរកសន្លឹកគណនាធ្នឹម ប៉ាន់ស្មាន BoQ ដែកសរសៃ គំរូរបាយការណ៍ និងធនធានបច្ចេកទេសសម្រាប់ការងារប្រចាំថ្ងៃ។'
                  : 'Run live ACI 318 beam flexure calculations, calculate multi-member BoQ takeoffs, reference rebar matrices, and download technical sheets.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/tools" className="btn-primary !rounded-xl !px-6 !py-3 text-center whitespace-nowrap shadow-lg">
                <Calculator className="h-4 w-4" />
                {km ? 'បើកម៉ាស៊ីនគណនា' : 'Open Calculators'}
              </Link>
              <Link to="/resources" className="btn-light !rounded-xl !px-6 !py-3 text-center whitespace-nowrap">
                {km ? 'មើលធនធាន' : 'Explore Library'}
              </Link>
            </div>
          </div>
        </section>

        {/* Technical Resources Section */}
        <section>
          <SectionHeading
            title={km ? 'ធនធានដែលបានជ្រើសរើស' : 'Tools & technical resources'}
            intro={
              km
                ? 'គំរូឯកសារ និងឧបករណ៍សម្រាប់ការសិក្សា និងការអនុវត្ត។'
                : 'Templates, spreadsheets and references to support engineering study and practice.'
            }
            linkTo="/resources"
            linkLabel={t('home.viewAll')}
          />
          {resources.loading && <p className="text-slate-500">{t('common.loading')}</p>}
          {resources.error && <p className="text-red-700">{t('common.error')}</p>}
          {resources.data && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resources.data.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </section>

        {/* Community Section */}
        <section className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-7 md:grid-cols-[1.4fr_.6fr] md:p-10 shadow-sm">
          <div>
            <p className="eyebrow">{km ? 'អភិវឌ្ឍចំណេះដឹងជាបន្តបន្ទាប់' : 'GROW WITH THE COMMUNITY'}</p>
            <h2 className="mt-2 text-2xl sm:text-3xl text-navy">
              {km ? 'ចែករំលែកចំណេះដឹងវិស្វកម្មជាមួយគ្នា' : 'Make engineering knowledge easier to access.'}
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              {km
                ? 'ChanCivil មានគោលបំណងចែករំលែកចំណេះដឹងដែលអាចយកទៅប្រើប្រាស់បាន និងជួយអភិវឌ្ឍសហគមន៍វិស្វករនៅកម្ពុជា។'
                : 'ChanCivil is building a practical knowledge space for students and professionals — with clear explanations, useful resources and responsible engineering practice.'}
            </p>
            <Link to="/about" className="btn-outline mt-5 !rounded-xl">
              {t('home.learnMore')}
            </Link>
          </div>
          <div className="rounded-2xl bg-surface p-6 border border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy">
              {t('home.follow')}
            </h3>
            <div className="mt-4">
              {hasSocial ? (
                <SocialLinks />
              ) : (
                <p className="text-sm leading-6 text-slate-500">{t('home.noSocial')}</p>
              )}
            </div>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"
            >
              {km ? 'ទាក់ទងមកយើង' : 'Get in touch'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <NewsletterForm />
      </div>
    </>
  );
}
