import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { siteUrl } from '../lib/utils';

interface SeoProps {
  title: string;
  description: string;
  /** Path starting with "/", used for the canonical URL. */
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

export default function Seo({ title, description, path, image, type = 'website', jsonLd, noindex }: SeoProps) {
  const { lang } = useLanguage();
  const base = siteUrl();
  const canonical = `${base}${path}`;
  const fullTitle = title.includes('ChanCivil') ? title : `${title} | ChanCivil`;
  const ogImage = image ? (image.startsWith('http') ? image : `${base}${image}`) : `${base}/logo.svg`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:site_name" content="ChanCivil" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === 'km' ? 'km_KH' : 'en_US'} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
