import { useState, type FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';
import Seo from '../components/Seo';
import SocialLinks, { getSocialItems } from '../components/SocialLinks';
import { useLanguage } from '../contexts/LanguageContext';
import { siteConfig } from '../lib/siteConfig';
import { isValidEmail } from '../lib/utils';
import { submitContactMessage } from '../services/content';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2 || form.name.length > 100) nextErrors.name = t('contact.errName');
    if (!isValidEmail(form.email)) nextErrors.email = t('contact.errEmail');
    if (form.message.trim().length < 10 || form.message.length > 5000) nextErrors.message = t('contact.errMessage');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('sending');
    setFeedback('');
    const result = await submitContactMessage(form);
    if (result.ok) {
      setStatus('success');
      setFeedback(t('contact.success'));
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } else {
      setStatus('error');
      setFeedback(result.reason === 'not_configured' ? t('contact.errNotConfigured') : t('contact.errGeneric'));
    }
  }

  const social = getSocialItems();
  const telegram = siteConfig.telegramUrl;

  return (
    <>
      <Seo title={t('contact.title')} description={t('contact.intro')} path="/contact" />
      <div className="container-page py-12">
        <h1 className="text-3xl sm:text-4xl">{t('contact.title')}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{t('contact.intro')}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            {/* Honeypot field: hidden from people, visible to simple bots. */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
            </div>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy">{t('contact.name')}</label>
              <input id="name" className="input" value={form.name} onChange={update('name')} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-err' : undefined} maxLength={100} />
              {errors.name && <p id="name-err" className="mt-1 text-sm text-red-700">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">{t('contact.email')}</label>
              <input id="email" type="email" className="input" value={form.email} onChange={update('email')} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-err' : undefined} maxLength={254} />
              {errors.email && <p id="email-err" className="mt-1 text-sm text-red-700">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium text-navy">{t('contact.subject')}</label>
              <input id="subject" className="input" value={form.subject} onChange={update('subject')} maxLength={200} />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy">{t('contact.message')}</label>
              <textarea id="message" rows={6} className="input" value={form.message} onChange={update('message')} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-err' : undefined} maxLength={5000} />
              {errors.message && <p id="message-err" className="mt-1 text-sm text-red-700">{errors.message}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={status === 'sending'}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {status === 'sending' ? t('contact.sending') : t('contact.send')}
            </button>

            <p role="status" aria-live="polite" className={`text-sm ${status === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
              {feedback}
            </p>
          </form>

          <aside className="space-y-6 rounded-lg bg-surface p-6">
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-base"><Mail className="h-4 w-4 text-brand" aria-hidden="true" />{t('contact.emailLabel')}</h2>
              {siteConfig.contactEmail ? (
                <a className="text-brand underline" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
              ) : (
                <p className="text-sm text-slate-500">{t('contact.emailPlaceholder')}</p>
              )}
            </div>
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-base"><Send className="h-4 w-4 text-brand" aria-hidden="true" />{t('contact.telegram')}</h2>
              {telegram ? (
                <a className="text-brand underline" href={telegram} target="_blank" rel="noopener noreferrer">{telegram}</a>
              ) : (
                <p className="text-sm text-slate-500">{t('contact.notConfigured')}</p>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-base">{t('contact.social')}</h2>
              {social.length > 0 ? <SocialLinks /> : <p className="text-sm text-slate-500">{t('contact.notConfigured')}</p>}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
