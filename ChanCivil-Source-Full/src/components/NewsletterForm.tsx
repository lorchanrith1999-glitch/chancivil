import { useState, type FormEvent } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeToNewsletter } from '../services/content';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function NewsletterForm() {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    const result = await subscribeToNewsletter(email, lang);
    if (result.ok) {
      setStatus('success');
      setMessage(t('newsletter.success'));
      setEmail('');
      return;
    }
    setStatus('error');
    setMessage(
      result.reason === 'invalid'
        ? t('newsletter.errInvalid')
        : result.reason === 'not_configured'
          ? t('newsletter.errNotConfigured')
          : t('newsletter.errGeneric'),
    );
  }

  return (
    <section aria-labelledby="newsletter-heading" className="rounded-lg bg-navy px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="newsletter-heading" className="text-2xl !text-white sm:text-3xl">
          {t('newsletter.title')}
        </h2>
        <p className="mt-2 text-slate-300">{t('newsletter.text')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            {t('newsletter.placeholder')}
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            className="input flex-1"
          />
          <button type="submit" disabled={status === 'sending'} className="btn-primary bg-accent text-navy hover:bg-accent-600">
            {status === 'sending' ? t('newsletter.sending') : t('newsletter.button')}
          </button>
        </form>

        <p
          role="status"
          aria-live="polite"
          className={`mt-3 min-h-[1.25rem] text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}
        >
          {message}
        </p>
      </div>
    </section>
  );
}
