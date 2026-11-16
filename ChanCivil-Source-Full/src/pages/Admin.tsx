import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowUpRight, BookOpen, Check, CircleHelp, Download,
  FileText, FolderOpen, Gauge, Image, LayoutDashboard, LogOut, Mail, Menu,
  MessageSquare, Plus, Search, Settings, ShieldCheck, Trash2, Upload, Users,
  X, Edit3, Save, RefreshCw, ExternalLink, LockKeyhole,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sampleArticles } from '../data/articles';
import { sampleResources } from '../data/resources';
import { articleCategories, resourceCategories } from '../data/categories';
import { siteConfig } from '../lib/siteConfig';
import './Admin.css';

type Role = 'super_admin' | 'editor' | 'author';
type Tab = 'overview' | 'articles' | 'resources' | 'categories' | 'media' | 'messages' | 'subscribers' | 'users' | 'activity' | 'settings';
type UserRole = { user_id: string; email: string; display_name: string | null; role: Role | null; can_publish: boolean; created_at: string };
type ArticleRow = Record<string, any> & { id: string; title_en: string; slug: string; status: string; featured: boolean; created_at: string };
type ResourceRow = Record<string, any> & { id: string; name_en: string; slug: string; status: string; is_free: boolean; download_count: number };
type CategoryRow = { id: string; kind: 'article' | 'resource'; slug: string; name_en: string; name_km: string };
type MessageRow = { id: string; name: string; email: string; subject: string | null; message: string; is_read: boolean; created_at: string };
type MediaRow = { id: string; bucket: string; path: string; file_name: string; mime_type: string | null; size_bytes: number | null; created_at: string };

const nav: { id: Tab; label: string; icon: typeof Gauge; admin?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: BookOpen },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'media', label: 'Media library', icon: Image },
  { id: 'messages', label: 'Messages', icon: MessageSquare, admin: true },
  { id: 'subscribers', label: 'Subscribers', icon: Mail, admin: true },
  { id: 'users', label: 'Users & roles', icon: Users, admin: true },
  { id: 'activity', label: 'Activity log', icon: Activity },
  { id: 'settings', label: 'Website settings', icon: Settings, admin: true },
];
const emptyArticle = { slug: '', title_en: '', title_km: '', description_en: '', description_km: '', content_en: '', content_km: '', status: 'draft', featured: false, read_minutes: 5, code_references: '', cover_alt_en: '', cover_alt_km: '', cover_image_path: '', category_id: '' };
const emptyResource = { slug: '', name_en: '', name_km: '', description_en: '', description_km: '', file_format: 'pdf', version: '1.0', is_free: true, price_amount: '', price_currency: 'USD', status: 'draft', featured: false, category_id: '', file_path: '', thumbnail_path: '' };
const niceDate = (s?: string) => s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fileSize = (n?: number | null) => !n ? '—' : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
function Stat({ label, value, note, icon: Icon }: { label: string; value: string | number; note: string; icon: typeof Gauge }) {
  return <div className="admin-stat"><div className="admin-stat-top"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small>{note}</small></div>;
}
function Notice({ children, type = 'info' }: { children: ReactNode; type?: 'info' | 'error' | 'success' }) {
  return <div className={`admin-notice ${type}`}>{children}</div>;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [stats, setStats] = useState<any>({});
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [settings, setSettings] = useState<{ key: string; value: any }[]>([]);
  const [query, setQuery] = useState('');
  const [editorKind, setEditorKind] = useState<'article' | 'resource' | 'category' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [previewMessage, setPreviewMessage] = useState<MessageRow | null>(null);
  const isAdmin = role === 'super_admin';
  const canEdit = role === 'super_admin' || role === 'editor';

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setSessionUser({ id: 'demo-admin', email: 'admin@chancivil.com' });
    setRole('super_admin');
    const demoArticles = sampleArticles.map((a) => ({
      id: a.id,
      title_en: a.title.en,
      title_km: a.title.km,
      slug: a.slug,
      description_en: a.description.en,
      description_km: a.description.km,
      content_en: a.content.en,
      content_km: a.content.km,
      status: 'published',
      featured: a.featured,
      read_minutes: a.readMinutes,
      code_references: a.references || [],
      cover_image_path: a.coverImageUrl || '',
      category_id: a.categorySlug,
      updated_at: a.publishedAt,
      created_at: a.publishedAt,
    }));
    const demoResources = sampleResources.map((r) => ({
      id: r.id,
      name_en: r.name.en,
      name_km: r.name.km,
      slug: r.slug,
      description_en: r.description.en,
      description_km: r.description.km,
      file_format: r.format,
      version: r.version,
      is_free: r.isFree,
      price_amount: 0,
      price_currency: 'USD',
      status: 'published',
      featured: r.featured,
      category_id: r.categorySlug,
      file_path: r.fileUrl || '',
      download_count: r.downloadCount,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));
    const demoCategories = [
      ...articleCategories.map((c, i) => ({
        id: `cat-art-${i}`,
        kind: 'article' as const,
        slug: c.slug,
        name_en: c.name.en,
        name_km: c.name.km,
        description_en: c.description.en,
        description_km: c.description.km,
        icon: c.icon,
        sort_order: i + 1,
      })),
      ...resourceCategories.map((c, i) => ({
        id: `cat-res-${i}`,
        kind: 'resource' as const,
        slug: c.slug,
        name_en: c.name.en,
        name_km: c.name.km,
        description_en: c.description.en,
        description_km: c.description.km,
        icon: c.icon,
        sort_order: i + 1,
      })),
    ];
    setArticles(demoArticles);
    setResources(demoResources);
    setCategories(demoCategories);
    setMessages([
      {
        id: 'msg-1',
        name: 'Sokha Meng',
        email: 'sokha.meng@engineer.kh',
        subject: 'Structural calculation template inquiry',
        message: 'Hello ChanCivil team, do you have an Excel template for two-way RC slab design according to ACI 318?',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'msg-2',
        name: 'David Wilson',
        email: 'david.w@construct-asia.com',
        subject: 'Collaboration on BIM guidelines',
        message: 'We appreciate your bilingual engineering guides. Would you be open to collaborating on Revit structural standards?',
        is_read: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]);
    setSubscribers([
      { id: 'sub-1', email: 'engineer.vibol@gmail.com', language: 'km', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'sub-2', email: 'chann.rathana@cadtech.kh', language: 'en', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    ]);
    setUsers([
      { user_id: 'demo-admin', email: 'admin@chancivil.com', display_name: 'Super Admin (Demo)', role: 'super_admin', can_publish: true, created_at: new Date().toISOString() },
      { user_id: 'editor-1', email: 'editor@chancivil.com', display_name: 'Lead Structural Editor', role: 'editor', can_publish: true, created_at: new Date().toISOString() },
    ]);
    setActivity([
      { id: 'act-1', action: 'article_published', entity_type: 'articles', entity_id: 'dead-load-vs-live-load', created_at: new Date().toISOString() },
      { id: 'act-2', action: 'admin_login', entity_type: 'auth', entity_id: 'admin@chancivil.com', created_at: new Date().toISOString() },
    ]);
    setSettings([
      { key: 'contact_email', value: siteConfig.contactEmail || 'contact@chancivil.com' },
      { key: 'facebook_url', value: siteConfig.facebookUrl || 'https://facebook.com/chancivil' },
      { key: 'telegram_url', value: siteConfig.telegramUrl || 'https://t.me/chancivil' },
      { key: 'youtube_url', value: siteConfig.youtubeUrl || 'https://youtube.com/@chancivil' },
      { key: 'tiktok_url', value: siteConfig.tiktokUrl || 'https://tiktok.com/@chancivil' },
    ]);
    setStats({
      total_articles: demoArticles.length,
      published_articles: demoArticles.filter((a) => a.status === 'published').length,
      draft_articles: 0,
      total_resources: demoResources.length,
      total_downloads: 1420,
      total_subscribers: 2,
    });
    setAuthLoading(false);
  };

  const loadIdentity = useCallback(async (user: any) => {
    if (!user || !supabase) { setSessionUser(null); setRole(null); return; }
    setSessionUser(user);
    const { data, error: roleError } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    if (roleError) { setError(roleError.message); setRole(null); }
    else setRole((data?.role as Role) ?? null);
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    if (!supabase) { setAuthLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => loadIdentity(data.session?.user ?? null)).finally(() => setAuthLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { void loadIdentity(session?.user ?? null); });
    return () => data.subscription.unsubscribe();
  }, [loadIdentity, isDemoMode]);

  const loadData = useCallback(async () => {
    if (isDemoMode) {
      setStats({
        total_articles: articles.length,
        published_articles: articles.filter((a) => a.status === 'published').length,
        draft_articles: articles.filter((a) => a.status === 'draft').length,
        total_resources: resources.length,
        total_downloads: 1420,
        total_subscribers: subscribers.length,
      });
      return;
    }
    if (!supabase || !sessionUser || !role) return;
    setBusy(true); setError('');
    const run = async (name: string, promise: PromiseLike<any>) => {
      const { data, error: e } = await promise;
      if (e) { if (!error) setError(`${name}: ${e.message}`); return null; }
      return data;
    };
    const [st, ar, re, ca, me, med, act, sett] = await Promise.all([
      canEdit ? run('Dashboard', supabase.rpc('admin_dashboard_stats')) : Promise.resolve(null),
      run('Articles', supabase.from('articles').select('*, article_categories(category_id)').order('updated_at', { ascending: false })),
      canEdit ? run('Resources', supabase.from('resources').select('*').order('updated_at', { ascending: false })) : Promise.resolve(null),
      run('Categories', supabase.from('categories').select('*').order('sort_order')),
      isAdmin ? run('Messages', supabase.from('contact_messages').select('*').order('created_at', { ascending: false })) : Promise.resolve(null),
      run('Media', supabase.from('media').select('*').order('created_at', { ascending: false }).limit(100)),
      canEdit ? run('Activity', supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)) : Promise.resolve(null),
      isAdmin ? run('Settings', supabase.from('website_settings').select('*').order('key')) : Promise.resolve(null),
    ]);
    setStats(st ?? {}); if (ar) setArticles(ar); if (re) setResources(re); if (ca) setCategories(ca);
    if (me) setMessages(me); if (med) setMedia(med); if (act) setActivity(act); if (sett) setSettings(sett);
    if (isAdmin) {
      const us = await run('Users', supabase.rpc('admin_list_users'));
      const subs = await run('Subscribers', supabase.from('subscribers').select('*').order('created_at', { ascending: false }));
      if (us) setUsers(us); if (subs) setSubscribers(subs);
    }
    setBusy(false);
  }, [sessionUser, role, isAdmin]);

  useEffect(() => { void loadData(); }, [loadData]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault(); if (!supabase) return;
    setAuthBusy(true); setAuthMessage('');
    const { error: e1 } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false); if (e1) setAuthMessage(e1.message); else setPassword('');
  };
  const resetPassword = async (e: FormEvent) => {
    e.preventDefault(); if (!supabase) return;
    setAuthBusy(true); const { error: e1 } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin` });
    setAuthBusy(false); setAuthMessage(e1 ? e1.message : 'Password reset email sent. Check your inbox.');
  };
  const signOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setSessionUser(null);
      setRole(null);
      return;
    }
    await supabase?.auth.signOut();
    navigate('/admin');
  };
  const flash = (s: string) => { setNotice(s); window.setTimeout(() => setNotice(''), 3500); };

  const saveArticle = async (e: FormEvent) => {
    e.preventDefault(); if (!editing) return;
    if (isDemoMode) {
      const nextItem = {
        id: editing.id || `art-${Date.now()}`,
        title_en: editing.title_en,
        title_km: editing.title_km || '',
        slug: editing.slug || slugify(editing.title_en),
        description_en: editing.description_en || '',
        description_km: editing.description_km || '',
        content_en: editing.content_en || '',
        content_km: editing.content_km || '',
        status: editing.status,
        featured: Boolean(editing.featured),
        read_minutes: Number(editing.read_minutes) || 5,
        code_references: String(editing.code_references || '').split('\n').map((x: string) => x.trim()).filter(Boolean),
        cover_alt_en: editing.cover_alt_en || '',
        cover_alt_km: editing.cover_alt_km || '',
        cover_image_path: editing.cover_image_path || null,
        category_id: editing.category_id || '',
        updated_at: new Date().toISOString(),
        created_at: editing.created_at || new Date().toISOString(),
      };
      setArticles(prev => editing.id ? prev.map(a => a.id === editing.id ? nextItem : a) : [nextItem, ...prev]);
      setEditorKind(null); setEditing(null); flash('Article saved successfully (Demo Mode).');
      return;
    }
    if (!supabase) return;
    setBusy(true); setError('');
    const payload = { slug: editing.slug || slugify(editing.title_en), title_en: editing.title_en, title_km: editing.title_km || '', description_en: editing.description_en || '', description_km: editing.description_km || '', content_en: editing.content_en || '', content_km: editing.content_km || '', status: editing.status, featured: Boolean(editing.featured), read_minutes: Number(editing.read_minutes) || 5, code_references: String(editing.code_references || '').split('\n').map((x: string) => x.trim()).filter(Boolean), cover_alt_en: editing.cover_alt_en || '', cover_alt_km: editing.cover_alt_km || '', cover_image_path: editing.cover_image_path || null, author_id: editing.author_id || sessionUser.id, created_by: editing.created_by || sessionUser.id, published_at: editing.status === 'published' ? (editing.published_at || new Date().toISOString()) : null };
    const q = editing.id ? supabase.from('articles').update(payload).eq('id', editing.id).select().single() : supabase.from('articles').insert(payload).select().single();
    const { data, error: e1 } = await q;
    if (e1) { setError(e1.message); setBusy(false); return; }
    await supabase.from('article_categories').delete().eq('article_id', data.id);
    if (editing.category_id) {
      const { error: e2 } = await supabase.from('article_categories').insert({ article_id: data.id, category_id: editing.category_id });
      if (e2) setError(`Article saved, but category was not linked: ${e2.message}`);
    }
    setEditorKind(null); setEditing(null); await loadData(); flash('Article saved successfully.');
  };
  const saveResource = async (e: FormEvent) => {
    e.preventDefault(); if (!editing) return;
    if (isDemoMode) {
      const nextItem = {
        id: editing.id || `res-${Date.now()}`,
        name_en: editing.name_en,
        name_km: editing.name_km || '',
        slug: editing.slug || slugify(editing.name_en),
        description_en: editing.description_en || '',
        description_km: editing.description_km || '',
        file_format: editing.file_format,
        version: editing.version || '1.0',
        is_free: Boolean(editing.is_free),
        price_amount: editing.is_free ? null : Number(editing.price_amount || 0),
        price_currency: editing.price_currency || 'USD',
        status: editing.status,
        featured: Boolean(editing.featured),
        category_id: editing.category_id || null,
        file_path: editing.file_path || null,
        thumbnail_path: editing.thumbnail_path || null,
        download_count: editing.download_count || 0,
        updated_at: new Date().toISOString(),
        created_at: editing.created_at || new Date().toISOString(),
      };
      setResources(prev => editing.id ? prev.map(r => r.id === editing.id ? nextItem : r) : [nextItem, ...prev]);
      setEditorKind(null); setEditing(null); flash('Resource saved successfully (Demo Mode).');
      return;
    }
    if (!supabase) return;
    setBusy(true); setError('');
    const payload = { slug: editing.slug || slugify(editing.name_en), name_en: editing.name_en, name_km: editing.name_km || '', description_en: editing.description_en || '', description_km: editing.description_km || '', file_format: editing.file_format, version: editing.version || '1.0', is_free: Boolean(editing.is_free), price_amount: editing.is_free ? null : Number(editing.price_amount || 0), price_currency: editing.price_currency || 'USD', status: editing.status, featured: Boolean(editing.featured), category_id: editing.category_id || null, file_path: editing.file_path || null, thumbnail_path: editing.thumbnail_path || null, file_size_bytes: editing.file_size_bytes || null, created_by: editing.created_by || sessionUser.id, published_at: editing.status === 'published' ? (editing.published_at || new Date().toISOString()) : null };
    const q = editing.id ? supabase.from('resources').update(payload).eq('id', editing.id) : supabase.from('resources').insert(payload);
    const { error: e1 } = await q;
    if (e1) { setError(e1.message); setBusy(false); return; }
    setEditorKind(null); setEditing(null); await loadData(); flash('Resource saved successfully.');
  };
  const saveCategory = async (e: FormEvent) => {
    e.preventDefault(); if (!editing) return;
    if (isDemoMode) {
      const nextItem = {
        id: editing.id || `cat-${Date.now()}`,
        kind: editing.kind,
        slug: editing.slug || slugify(editing.name_en),
        name_en: editing.name_en,
        name_km: editing.name_km || '',
        description_en: editing.description_en || '',
        description_km: editing.description_km || '',
        icon: editing.icon || 'book',
        sort_order: Number(editing.sort_order) || 0,
      };
      setCategories(prev => editing.id ? prev.map(c => c.id === editing.id ? nextItem : c) : [...prev, nextItem]);
      setEditorKind(null); setEditing(null); flash('Category saved (Demo Mode).');
      return;
    }
    if (!supabase) return;
    setBusy(true);
    const payload = { kind: editing.kind, slug: editing.slug || slugify(editing.name_en), name_en: editing.name_en, name_km: editing.name_km || '', description_en: editing.description_en || '', description_km: editing.description_km || '', icon: editing.icon || 'book', sort_order: Number(editing.sort_order) || 0 };
    const q = editing.id ? supabase.from('categories').update(payload).eq('id', editing.id) : supabase.from('categories').insert(payload);
    const { error: e1 } = await q; setBusy(false);
    if (e1) { setError(e1.message); return; }
    setEditorKind(null); setEditing(null); await loadData(); flash('Category saved.');
  };
  const removeRow = async (table: string, id: string) => {
    if (!confirm('Delete this item? This action cannot be undone.')) return;
    if (isDemoMode) {
      if (table === 'articles') setArticles(prev => prev.filter(a => a.id !== id));
      else if (table === 'resources') setResources(prev => prev.filter(r => r.id !== id));
      else if (table === 'categories') setCategories(prev => prev.filter(c => c.id !== id));
      flash('Item deleted (Demo Mode).');
      return;
    }
    if (!supabase) return;
    const { error: e1 } = await supabase.from(table).delete().eq('id', id);
    if (e1) setError(e1.message); else { await loadData(); flash('Item deleted.'); }
  };
  const uploadFile = async (file: File, bucket: 'public-media' | 'resource-files') => {
    if (isDemoMode) {
      const localUrl = URL.createObjectURL(file);
      const newMedia: MediaRow = {
        id: `media-${Date.now()}`,
        bucket,
        path: localUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        created_at: new Date().toISOString(),
      };
      setMedia(prev => [newMedia, ...prev]);
      flash('File uploaded (Demo Mode).');
      return localUrl;
    }
    if (!supabase) return;
    const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    const folder = bucket === 'resource-files' ? 'files' : 'articles';
    const path = `${folder}/${sessionUser.id}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (upErr) { setError(upErr.message); return; }
    const { error: dbErr } = await supabase.from('media').insert({ bucket, path, file_name: file.name, mime_type: file.type, size_bytes: file.size, uploaded_by: sessionUser.id });
    if (dbErr) setError(`File uploaded, but media record failed: ${dbErr.message}`);
    await loadData(); flash('File uploaded.');
    return path;
  };
  const markRead = async (m: MessageRow) => {
    if (isDemoMode) {
      setMessages(prev => prev.map(item => item.id === m.id ? { ...item, is_read: true } : item));
      setPreviewMessage(m);
      return;
    }
    if (!supabase) return;
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', m.id);
    setPreviewMessage(m); await loadData();
  };
  const saveSetting = async (key: string, value: string) => {
    if (isDemoMode) {
      let parsed: any = value; try { parsed = JSON.parse(value); } catch {}
      setSettings(prev => {
        const idx = prev.findIndex(s => s.key === key);
        if (idx >= 0) {
          const next = [...prev]; next[idx] = { key, value: parsed }; return next;
        }
        return [...prev, { key, value: parsed }];
      });
      flash('Setting saved (Demo Mode).');
      window.dispatchEvent(new Event('chancivil-settings-updated'));
      return;
    }
    if (!supabase) return;
    let parsed: any = value; try { parsed = JSON.parse(value); } catch { /* store plain text */ }
    const { error: e1 } = await supabase.from('website_settings').upsert({ key, value: parsed, updated_by: sessionUser.id }, { onConflict: 'key' });
    if (e1) setError(e1.message); else { window.dispatchEvent(new Event('chancivil-settings-updated')); await loadData(); flash('Setting saved.'); }
  };
  const updateRole = async (u: UserRole, newRole: string, canPublish: boolean) => {
    if (isDemoMode) {
      setUsers(prev => prev.map(user => user.user_id === u.user_id ? { ...user, role: (newRole || null) as Role | null, can_publish: canPublish } : user));
      flash('User role updated (Demo Mode).');
      return;
    }
    if (!supabase) return;
    if (!newRole) { const { error: e1 } = await supabase.from('user_roles').delete().eq('user_id', u.user_id); if (e1) setError(e1.message); }
    else { const { error: e1 } = await supabase.from('user_roles').upsert({ user_id: u.user_id, role: newRole, can_publish: canPublish, granted_by: sessionUser.id }, { onConflict: 'user_id' }); if (e1) setError(e1.message); }
    await loadData();
  };

  const filteredArticles = useMemo(() => articles.filter(a => `${a.title_en} ${a.slug} ${a.status}`.toLowerCase().includes(query.toLowerCase())), [articles, query]);
  const filteredResources = useMemo(() => resources.filter(a => `${a.name_en} ${a.slug} ${a.status}`.toLowerCase().includes(query.toLowerCase())), [resources, query]);

  if (authLoading) return <div className="admin-loading">Loading ChanCivil Admin…</div>;
  if (!isSupabaseConfigured && !isDemoMode) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <div className="admin-brand-mark">CC</div>
          <p className="admin-kicker">ADMIN CONTROL</p>
          <h1>ChanCivil Admin Control</h1>
          <p>Sign in to manage your engineering content, resources and website.</p>
          <button
            type="button"
            className="admin-btn admin-btn-primary admin-full"
            style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
            onClick={enterDemoMode}
          >
            ⚡ Open Admin Control (Demo / Offline Mode)
          </button>
          <Notice type="info">
            Cloud database is not connected yet. Click the button above to explore and test all CMS features in Demo Mode, or add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> for cloud persistence.
          </Notice>
          <Link className="admin-back-link" to="/">← Back to website</Link>
        </div>
      </div>
    );
  }
  if (!sessionUser && !isDemoMode) {
    return (
      <div className="admin-auth-shell">
        <form className="admin-auth-card" onSubmit={authMode === 'login' ? signIn : resetPassword}>
          <Link to="/" className="admin-auth-home">← ChanCivil website</Link>
          <div className="admin-brand-mark">CC</div>
          <p className="admin-kicker">PRIVATE WORKSPACE</p>
          <h1>{authMode === 'login' ? 'Welcome back.' : 'Reset your password.'}</h1>
          <p>Sign in to manage your engineering content, resources and website.</p>
          <Field label="Email address"><input className="admin-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
          {authMode === 'login' && <Field label="Password"><input className="admin-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" /></Field>}
          {authMessage && <Notice type={authMessage.includes('sent') ? 'success' : 'error'}>{authMessage}</Notice>}
          <button className="admin-btn admin-btn-primary admin-full" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'login' ? 'Sign in securely' : 'Send reset link'}</button>
          <button
            type="button"
            className="admin-btn admin-btn-outline admin-full"
            style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={enterDemoMode}
          >
            ⚡ Preview in Demo Admin Mode
          </button>
          <button type="button" className="admin-link-button" onClick={() => { setAuthMode(authMode === 'login' ? 'forgot' : 'login'); setAuthMessage(''); }}>{authMode === 'login' ? 'Forgot password?' : 'Back to sign in'}</button>
          <div className="admin-auth-foot"><LockKeyhole size={14} /> Protected by Supabase authentication and database access rules</div>
        </form>
      </div>
    );
  }
  if (!role && !isDemoMode) return <div className="admin-auth-shell"><div className="admin-auth-card"><div className="admin-brand-mark">CC</div><p className="admin-kicker">ACCESS NOT GRANTED</p><h1>Your account has no admin role.</h1><p>Ask the ChanCivil Super Admin to assign you an Author, Editor or Super Admin role. This account cannot access the dashboard.</p>{error && <Notice type="error">{error}</Notice>}<button className="admin-btn admin-btn-outline admin-full" onClick={signOut}>Sign out</button></div></div>;

  const activeNav = nav.find(n => n.id === tab)!;
  const title = activeNav.label;
  const openEditor = (kind: 'article' | 'resource' | 'category', row?: any) => {
    setEditorKind(kind);
    if (kind === 'article') setEditing(row ? { ...row, code_references: (row.code_references || []).join('\n'), category_id: row.article_categories?.[0]?.category_id || '' } : { ...emptyArticle });
    else if (kind === 'resource') setEditing(row ? { ...row } : { ...emptyResource });
    else setEditing(row ? { ...row } : { kind: 'article', slug: '', name_en: '', name_km: '', description_en: '', description_km: '', icon: 'book', sort_order: 0 });
  };
  const saveCurrent = (e: FormEvent) => editorKind === 'article' ? saveArticle(e) : editorKind === 'resource' ? saveResource(e) : saveCategory(e);

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="admin-side-brand"><div className="admin-brand-mark small">CC</div><div><b>ChanCivil</b><small>ADMIN CONTROL</small></div><button className="admin-icon-btn admin-mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="admin-side-label">WORKSPACE</div>
      <nav className="admin-nav">{nav.filter(n => (!n.admin || isAdmin) && (role !== 'author' || ['overview','articles'].includes(n.id))).map(n => { const Icon = n.icon; return <button key={n.id} className={tab === n.id ? 'active' : ''} onClick={() => { setTab(n.id); setQuery(''); setSidebarOpen(false); }}><Icon size={17}/><span>{n.label}</span>{n.id === 'messages' && messages.filter(m => !m.is_read).length > 0 && <i>{messages.filter(m => !m.is_read).length}</i>}</button>; })}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-user-chip"><div className="admin-avatar">{(sessionUser?.email || 'A').slice(0,1).toUpperCase()}</div><div><b>{sessionUser?.email}</b><small>{(role || 'super_admin').replace('_', ' ')}</small></div></div><button className="admin-signout" onClick={signOut}><LogOut size={16}/> Sign out</button></div>
    </aside>
    {sidebarOpen && <button className="admin-mobile-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"/>}
    <main className="admin-main"><header className="admin-topbar"><button className="admin-icon-btn admin-menu-toggle" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button><div><span className="admin-top-eyebrow">CHAN CIVIL / ADMIN</span><h1>{title}</h1></div><div className="admin-top-actions"><span className="admin-role-pill"><ShieldCheck size={14}/>{(role || 'super_admin').replace('_', ' ')}</span><a href="/" target="_blank" rel="noreferrer" className="admin-view-site">View website <ExternalLink size={14}/></a><button className="admin-icon-btn" onClick={() => void loadData()} title="Refresh"><RefreshCw size={17}/></button></div></header>
      <div className="admin-content">
        {isDemoMode && (
          <div style={{ background: '#0e2b45', border: '1px solid #35b6c9', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbebf3', fontSize: '0.85rem' }}>
            <span>⚡ <b>Demo Admin Mode Active:</b> You can create, edit, delete articles/resources and change settings interactively. Connect Supabase in <code>.env.local</code> for persistent cloud storage.</span>
          </div>
        )}
        {error && <Notice type="error">{error}<button onClick={() => setError('')} aria-label="Dismiss"><X size={14}/></button></Notice>}{notice && <Notice type="success"><Check size={15}/>{notice}</Notice>}
        {tab === 'overview' && <><div className="admin-welcome"><div><p className="admin-kicker">YOUR PUBLISHING DESK</p><h2>Good day, {sessionUser.email?.split('@')[0]}.</h2><p>Manage your engineering knowledge platform from one place.</p></div><button className="admin-btn admin-btn-primary" onClick={() => openEditor('article')}><Plus size={16}/> New article</button></div><div className="admin-stat-grid"><Stat label="Total articles" value={stats.total_articles ?? articles.length} note={`${stats.published_articles ?? articles.filter(a=>a.status==='published').length} published`} icon={BookOpen}/><Stat label="Draft articles" value={stats.draft_articles ?? articles.filter(a=>a.status==='draft').length} note="Ready for review" icon={Edit3}/><Stat label="Resources" value={stats.total_resources ?? resources.length} note={`${stats.total_downloads ?? 0} downloads`} icon={Download}/><Stat label="Subscribers" value={isAdmin ? (stats.total_subscribers ?? subscribers.length) : '—'} note={isAdmin ? 'Newsletter audience' : 'Super Admin only'} icon={Users}/></div><div className="admin-dashboard-grid"><section className="admin-panel"><div className="admin-panel-head"><div><h3>Recent articles</h3><p>Your latest content updates</p></div><button className="admin-text-btn" onClick={() => setTab('articles')}>View all <ArrowUpRight size={14}/></button></div>{articles.slice(0,5).map(a=><div className="admin-list-row" key={a.id}><div className="admin-list-icon"><BookOpen size={16}/></div><div className="admin-list-main"><b>{a.title_en}</b><small>Updated {niceDate(a.updated_at)}</small></div><span className={`admin-status ${a.status}`}>{a.status}</span><button className="admin-icon-btn" onClick={() => openEditor('article',a)}><Edit3 size={15}/></button></div>)}{!articles.length && <p className="admin-empty">No articles yet. Create your first article.</p>}</section><section className="admin-panel"><div className="admin-panel-head"><div><h3>Quick actions</h3><p>Common publishing tasks</p></div></div><div className="admin-quick-actions"><button onClick={() => openEditor('article')}><span><BookOpen size={18}/></span><b>Write an article</b><small>Publish bilingual engineering content</small><ArrowUpRight size={15}/></button><button onClick={() => openEditor('resource')}><span><FileText size={18}/></span><b>Add a resource</b><small>Upload a PDF, Excel or template</small><ArrowUpRight size={15}/></button><button onClick={() => setTab('media')}><span><Image size={18}/></span><b>Upload media</b><small>Manage images and downloadable files</small><ArrowUpRight size={15}/></button><button onClick={() => setTab('settings')}><span><Settings size={18}/></span><b>Website settings</b><small>Update social links and contact details</small><ArrowUpRight size={15}/></button></div></section></div><div className="admin-panel admin-tip"><CircleHelp size={18}/><div><b>Publishing responsibly</b><p>Technical articles and calculation resources should identify assumptions, applicable code editions and limitations. Have project-specific engineering work reviewed by a qualified professional.</p></div></div></>}
        {tab === 'articles' && <><div className="admin-page-intro"><div><h2>Articles</h2><p>Create, edit, save as draft or publish bilingual engineering articles.</p></div>{canEdit && <button className="admin-btn admin-btn-primary" onClick={() => openEditor('article')}><Plus size={16}/> New article</button>}</div><div className="admin-toolbar"><div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search articles…"/></div><span>{filteredArticles.length} articles</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Article</th><th>Status</th><th>Featured</th><th>Last updated</th><th></th></tr></thead><tbody>{filteredArticles.map(a=><tr key={a.id}><td><b>{a.title_en}</b><small>/{a.slug}</small></td><td><span className={`admin-status ${a.status}`}>{a.status}</span></td><td>{a.featured?'Yes':'—'}</td><td>{niceDate(a.updated_at)}</td><td className="admin-actions-cell"><button className="admin-icon-btn" onClick={()=>openEditor('article',a)} title="Edit"><Edit3 size={15}/></button>{canEdit&&<button className="admin-icon-btn danger" onClick={()=>removeRow('articles',a.id)} title="Delete"><Trash2 size={15}/></button>}</td></tr>)}</tbody></table>{!filteredArticles.length&&<p className="admin-empty">No articles match your search.</p>}</div></>}
        {tab === 'resources' && <><div className="admin-page-intro"><div><h2>Resources</h2><p>Manage downloadable engineering templates, spreadsheets, PDFs and guides.</p></div>{canEdit&&<button className="admin-btn admin-btn-primary" onClick={()=>openEditor('resource')}><Plus size={16}/> Add resource</button>}</div><div className="admin-toolbar"><div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search resources…"/></div><span>{filteredResources.length} resources</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Resource</th><th>Format</th><th>Access</th><th>Status</th><th>Downloads</th><th></th></tr></thead><tbody>{filteredResources.map(r=><tr key={r.id}><td><b>{r.name_en}</b><small>/{r.slug}</small></td><td>{r.file_format?.toUpperCase()}</td><td>{r.is_free?'Free':`$${r.price_amount??0}`}</td><td><span className={`admin-status ${r.status}`}>{r.status}</span></td><td>{r.download_count}</td><td className="admin-actions-cell"><button className="admin-icon-btn" onClick={()=>openEditor('resource',r)}><Edit3 size={15}/></button>{canEdit&&<button className="admin-icon-btn danger" onClick={()=>removeRow('resources',r.id)}><Trash2 size={15}/></button>}</td></tr>)}</tbody></table>{!filteredResources.length&&<p className="admin-empty">No resources found.</p>}</div></>}
        {tab === 'categories' && <><div className="admin-page-intro"><div><h2>Categories</h2><p>Organise articles and downloadable resources.</p></div>{canEdit&&<button className="admin-btn admin-btn-primary" onClick={()=>openEditor('category')}><Plus size={16}/> Add category</button>}</div><div className="admin-category-grid">{categories.map(c=><div className="admin-category-card" key={c.id}><div className="admin-category-icon"><FolderOpen size={19}/></div><div><b>{c.name_en}</b><small>{c.kind} · /{c.slug}</small></div><button className="admin-icon-btn" onClick={()=>openEditor('category',c)}><Edit3 size={15}/></button>{canEdit&&<button className="admin-icon-btn danger" onClick={()=>removeRow('categories',c.id)}><Trash2 size={15}/></button>}</div>)}</div></>}
        {tab === 'media' && <><div className="admin-page-intro"><div><h2>Media library</h2><p>Upload article images to public storage and resource files to private storage.</p></div><label className="admin-btn admin-btn-primary upload-label"><Upload size={16}/> Upload files<input type="file" hidden multiple onChange={async e=>{const list=Array.from(e.target.files||[]);for(const f of list)await uploadFile(f, f.type.startsWith('image/')?'public-media':'resource-files');e.target.value='';}}/></label></div><Notice>Images go to <b>public-media</b>. PDFs, Excel and ZIP files go to <b>resource-files</b> and remain private. Maximum sizes are set by your Supabase storage policies.</Notice><div className="admin-media-grid">{media.map(m=>{const publicUrl=m.bucket==='public-media'?supabase?.storage.from('public-media').getPublicUrl(m.path).data.publicUrl:null;return <div className="admin-media-card" key={m.id}><div className="admin-media-preview">{publicUrl&&m.mime_type?.startsWith('image/')?<img src={publicUrl} alt={m.file_name}/>:<FileText size={30}/>}</div><b title={m.file_name}>{m.file_name}</b><small>{m.bucket} · {fileSize(m.size_bytes)}</small><div className="admin-media-path"><code>{m.path}</code><button className="admin-icon-btn" onClick={()=>navigator.clipboard.writeText(m.path)} title="Copy path"><Save size={14}/></button></div></div>})}</div>{!media.length&&<p className="admin-empty">Your media library is empty. Upload your first file.</p>}</>}
        {tab === 'messages' && <><div className="admin-page-intro"><div><h2>Contact messages</h2><p>Messages submitted through the public website contact form.</p></div><span className="admin-count-pill">{messages.filter(m=>!m.is_read).length} unread</span></div><div className="admin-message-list">{messages.map(m=><button key={m.id} className={`admin-message-row ${!m.is_read?'unread':''}`} onClick={()=>void markRead(m)}><span className="admin-message-avatar">{m.name.slice(0,1).toUpperCase()}</span><span className="admin-message-content"><b>{m.name} <small>{m.email}</small></b><strong>{m.subject||'No subject'}</strong><span>{m.message}</span></span><time>{niceDate(m.created_at)}</time></button>)}</div>{!messages.length&&<p className="admin-empty">No contact messages yet.</p>}</>}
        {tab === 'subscribers' && <><div className="admin-page-intro"><div><h2>Newsletter subscribers</h2><p>Manage your ChanCivil email audience. Only Super Admins can view this list.</p></div><button className="admin-btn admin-btn-outline" onClick={()=>{const csv=['email,language,created_at',...subscribers.map(s=>`${s.email},${s.language},${s.created_at}`)].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='chancivil-subscribers.csv';a.click();URL.revokeObjectURL(a.href);}}><Download size={15}/> Export CSV</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Email</th><th>Language</th><th>Subscribed</th></tr></thead><tbody>{subscribers.map(s=><tr key={s.id}><td><b>{s.email}</b></td><td>{s.language?.toUpperCase()}</td><td>{niceDate(s.created_at)}</td></tr>)}</tbody></table></div></>}
        {tab === 'users' && <><div className="admin-page-intro"><div><h2>Users & roles</h2><p>Assign permissions to accounts created in Supabase Authentication.</p></div></div><Notice>For security, create or invite user accounts in Supabase Dashboard → Authentication → Users. Then assign their role here.</Notice><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Can publish</th><th>Joined</th><th></th></tr></thead><tbody>{users.map(u=><tr key={u.user_id}><td><b>{u.display_name||u.email}</b><small>{u.email}</small></td><td><select className="admin-inline-select" value={u.role||''} onChange={e=>void updateRole(u,e.target.value,u.can_publish)}><option value="">No role</option><option value="author">Author</option><option value="editor">Editor</option><option value="super_admin">Super Admin</option></select></td><td><input type="checkbox" checked={u.can_publish} disabled={u.role!=='author'} onChange={e=>void updateRole(u,u.role||'',e.target.checked)}/></td><td>{niceDate(u.created_at)}</td><td>{u.user_id===sessionUser.id&&<span className="admin-status published">You</span>}</td></tr>)}</tbody></table></div></>}
        {tab === 'activity' && <><div className="admin-page-intro"><div><h2>Activity log</h2><p>Recent content and account events recorded by the database.</p></div></div><div className="admin-timeline">{activity.map(a=><div className="admin-timeline-row" key={a.id}><span className="admin-timeline-dot"/><div><b>{a.action.replaceAll('_',' ')}</b><p>{a.entity_type}{a.entity_id?` · ${a.entity_id}`:''}</p><small>{niceDate(a.created_at)} · {new Date(a.created_at).toLocaleTimeString()}</small></div></div>)}</div>{!activity.length&&<p className="admin-empty">No activity recorded yet.</p>}</>}
        {tab === 'settings' && <><div className="admin-page-intro"><div><h2>Website settings</h2><p>Edit public website details without changing source code.</p></div></div><div className="admin-settings-grid">{settings.map(s=><SettingEditor key={s.key} item={s} onSave={saveSetting}/>)}</div><div className="admin-panel admin-setting-add"><h3>Add or update a setting</h3><SettingAdder onSave={saveSetting}/></div></>}
      </div>
    </main>
    {editorKind && editing && <div className="admin-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget){setEditorKind(null);setEditing(null);}}}><form className="admin-editor-modal" onSubmit={saveCurrent}><div className="admin-modal-head"><div><p className="admin-kicker">CONTENT EDITOR</p><h2>{editing.id?'Edit':'Create'} {editorKind}</h2></div><button type="button" className="admin-icon-btn" onClick={()=>{setEditorKind(null);setEditing(null);}}><X size={19}/></button></div><div className="admin-modal-body">
      {editorKind==='article' && <><div className="admin-form-grid"><Field label="Title (English)"><input className="admin-input" required value={editing.title_en} onChange={e=>setEditing({...editing,title_en:e.target.value,slug:editing.slug||slugify(e.target.value)})}/></Field><Field label="Title (Khmer)"><input className="admin-input" value={editing.title_km} onChange={e=>setEditing({...editing,title_km:e.target.value})}/></Field><Field label="URL slug"><input className="admin-input" required value={editing.slug} onChange={e=>setEditing({...editing,slug:slugify(e.target.value)})}/></Field><Field label="Category"><select className="admin-input" value={editing.category_id} onChange={e=>setEditing({...editing,category_id:e.target.value})}><option value="">Select category</option>{categories.filter(c=>c.kind==='article').map(c=><option key={c.id} value={c.id}>{c.name_en}</option>)}</select></Field><Field label="Short description (English)"><textarea className="admin-input" rows={2} value={editing.description_en} onChange={e=>setEditing({...editing,description_en:e.target.value})}/></Field><Field label="Short description (Khmer)"><textarea className="admin-input" rows={2} value={editing.description_km} onChange={e=>setEditing({...editing,description_km:e.target.value})}/></Field></div><Field label="Article content — English (HTML supported)"><textarea className="admin-input admin-code-input" rows={9} value={editing.content_en} onChange={e=>setEditing({...editing,content_en:e.target.value})} placeholder="<p>Write your article…</p>"/></Field><Field label="Article content — Khmer (HTML supported)"><textarea className="admin-input admin-code-input" rows={7} value={editing.content_km} onChange={e=>setEditing({...editing,content_km:e.target.value})}/></Field><div className="admin-form-grid"><Field label="Read time (minutes)"><input className="admin-input" type="number" min="1" max="240" value={editing.read_minutes} onChange={e=>setEditing({...editing,read_minutes:e.target.value})}/></Field><Field label="Code references (one per line)"><textarea className="admin-input" rows={3} value={editing.code_references} onChange={e=>setEditing({...editing,code_references:e.target.value})}/></Field><div className="admin-form-grid"><Field label="Publishing status"><select className="admin-input" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}><option value="draft">Save as draft</option><option value="published">Publish on website</option></select></Field><label className="admin-check"><input type="checkbox" checked={Boolean(editing.featured)} onChange={e=>setEditing({...editing,featured:e.target.checked})}/> Feature on homepage</label></div><Field label="Cover image"><div className="admin-upload-line"><input className="admin-input" value={editing.cover_image_path||''} onChange={e=>setEditing({...editing,cover_image_path:e.target.value})} placeholder="Storage path or upload an image"/><label className="admin-btn admin-btn-outline upload-label"><Upload size={14}/> Upload image<input hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async e=>{const f=e.target.files?.[0];if(f){const p=await uploadFile(f,'public-media');if(p)setEditing((old:any)=>({...old,cover_image_path:p}));}e.target.value='';}}/></label></div></Field></div></>}
      {editorKind==='resource' && <><div className="admin-form-grid"><Field label="Resource name (English)"><input className="admin-input" required value={editing.name_en} onChange={e=>setEditing({...editing,name_en:e.target.value,slug:editing.slug||slugify(e.target.value)})}/></Field><Field label="Resource name (Khmer)"><input className="admin-input" value={editing.name_km} onChange={e=>setEditing({...editing,name_km:e.target.value})}/></Field><Field label="URL slug"><input className="admin-input" required value={editing.slug} onChange={e=>setEditing({...editing,slug:slugify(e.target.value)})}/></Field><Field label="Category"><select className="admin-input" value={editing.category_id||''} onChange={e=>setEditing({...editing,category_id:e.target.value})}><option value="">Select category</option>{categories.filter(c=>c.kind==='resource').map(c=><option key={c.id} value={c.id}>{c.name_en}</option>)}</select></Field><Field label="Format"><select className="admin-input" value={editing.file_format} onChange={e=>setEditing({...editing,file_format:e.target.value})}>{['pdf','xlsx','xls','docx','doc','zip','other'].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Version"><input className="admin-input" value={editing.version} onChange={e=>setEditing({...editing,version:e.target.value})}/></Field></div><Field label="Description (English)"><textarea className="admin-input" rows={3} value={editing.description_en} onChange={e=>setEditing({...editing,description_en:e.target.value})}/></Field><Field label="Description (Khmer)"><textarea className="admin-input" rows={3} value={editing.description_km} onChange={e=>setEditing({...editing,description_km:e.target.value})}/></Field><Field label="Resource file (private storage)"><div className="admin-upload-line"><input className="admin-input" value={editing.file_path||''} onChange={e=>setEditing({...editing,file_path:e.target.value})} placeholder="No file uploaded"/><label className="admin-btn admin-btn-outline upload-label"><Upload size={14}/> Choose file<input hidden type="file" onChange={async e=>{const f=e.target.files?.[0];if(f){const p=await uploadFile(f,'resource-files');if(p)setEditing((old:any)=>({...old,file_path:p,file_size_bytes:f.size,file_format:f.name.split('.').pop()?.toLowerCase()||old.file_format}));}}}/></label></div></Field><div className="admin-form-grid"><Field label="Thumbnail path"><input className="admin-input" value={editing.thumbnail_path||''} onChange={e=>setEditing({...editing,thumbnail_path:e.target.value})}/></Field><Field label="Price (USD, if paid)"><input className="admin-input" type="number" min="0" step="0.01" value={editing.price_amount||''} onChange={e=>setEditing({...editing,price_amount:e.target.value})}/></Field></div><div className="admin-form-grid"><Field label="Publishing status"><select className="admin-input" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}><option value="draft">Save as draft</option><option value="published">Publish on website</option></select></Field><label className="admin-check"><input type="checkbox" checked={Boolean(editing.featured)} onChange={e=>setEditing({...editing,featured:e.target.checked})}/> Feature on homepage</label></div><label className="admin-check"><input type="checkbox" checked={editing.is_free} onChange={e=>setEditing({...editing,is_free:e.target.checked})}/> Free resource</label></>}
      {editorKind==='category' && <><div className="admin-form-grid"><Field label="Category type"><select className="admin-input" value={editing.kind} onChange={e=>setEditing({...editing,kind:e.target.value})}><option value="article">Article</option><option value="resource">Resource</option></select></Field><Field label="URL slug"><input className="admin-input" value={editing.slug} onChange={e=>setEditing({...editing,slug:slugify(e.target.value)})}/></Field><Field label="Name (English)"><input className="admin-input" required value={editing.name_en} onChange={e=>setEditing({...editing,name_en:e.target.value,slug:editing.slug||slugify(e.target.value)})}/></Field><Field label="Name (Khmer)"><input className="admin-input" value={editing.name_km} onChange={e=>setEditing({...editing,name_km:e.target.value})}/></Field><Field label="Icon name"><input className="admin-input" value={editing.icon} onChange={e=>setEditing({...editing,icon:e.target.value})}/></Field><Field label="Sort order"><input className="admin-input" type="number" value={editing.sort_order} onChange={e=>setEditing({...editing,sort_order:e.target.value})}/></Field></div><Field label="Description (English)"><textarea className="admin-input" rows={2} value={editing.description_en} onChange={e=>setEditing({...editing,description_en:e.target.value})}/></Field><Field label="Description (Khmer)"><textarea className="admin-input" rows={2} value={editing.description_km} onChange={e=>setEditing({...editing,description_km:e.target.value})}/></Field></>}
    </div><div className="admin-modal-foot"><button type="button" className="admin-btn admin-btn-outline" onClick={()=>{setEditorKind(null);setEditing(null);}}>Cancel</button><button className="admin-btn admin-btn-primary" disabled={busy}><Save size={15}/>{busy?'Saving…':'Save changes'}</button></div></form></div>}
    {previewMessage && <div className="admin-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPreviewMessage(null);}}><div className="admin-editor-modal message-modal"><div className="admin-modal-head"><div><p className="admin-kicker">CONTACT MESSAGE</p><h2>{previewMessage.subject||'No subject'}</h2></div><button className="admin-icon-btn" onClick={()=>setPreviewMessage(null)}><X size={18}/></button></div><div className="admin-modal-body"><p><b>{previewMessage.name}</b> · {previewMessage.email}</p><p className="admin-message-full">{previewMessage.message}</p><small>Received {niceDate(previewMessage.created_at)}</small></div><div className="admin-modal-foot"><a className="admin-btn admin-btn-primary" href={`mailto:${previewMessage.email}?subject=${encodeURIComponent('Re: '+(previewMessage.subject||'Your message to ChanCivil'))}`}>Reply by email <ArrowUpRight size={15}/></a></div></div></div>}
  </div>;
}

function SettingEditor({ item, onSave }: { item: { key: string; value: any }; onSave: (k:string,v:string)=>void }) {
  const [value,setValue]=useState(typeof item.value==='string'?item.value:JSON.stringify(item.value,null,2));
  return <div className="admin-setting-card"><b>{item.key}</b><textarea className="admin-input" rows={3} value={value} onChange={e=>setValue(e.target.value)}/><button className="admin-btn admin-btn-outline" onClick={()=>onSave(item.key,value)}><Save size={14}/> Save</button></div>;
}
function SettingAdder({ onSave }: { onSave: (k:string,v:string)=>void }) {
  const [key,setKey]=useState(''); const [value,setValue]=useState('');
  return <div className="admin-setting-add-row"><input className="admin-input" placeholder="setting_key" value={key} onChange={e=>setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}/><input className="admin-input" placeholder="Value (text or JSON)" value={value} onChange={e=>setValue(e.target.value)}/><button className="admin-btn admin-btn-primary" disabled={!key} onClick={()=>{onSave(key,value);setKey('');setValue('');}}><Plus size={15}/> Save setting</button></div>;
}
