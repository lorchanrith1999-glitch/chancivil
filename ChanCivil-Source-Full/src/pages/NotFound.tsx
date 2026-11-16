import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFound({ article = false }: { article?: boolean }) {
  const { t } = useLanguage();
  const title = article ? t('articles.notFoundTitle') : t('notFound.title');
  const text = article ? t('articles.notFoundText') : t('notFound.text');
  return (
    <>
      <Seo title={title} description={text} path="/404" noindex />
      <div className="container-page py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">{text}</p>
        <Link to={article ? '/articles' : '/'} className="btn-primary mt-6">
          {article ? t('common.backToArticles') : t('notFound.back')}
        </Link>
      </div>
    </>
  );
}
