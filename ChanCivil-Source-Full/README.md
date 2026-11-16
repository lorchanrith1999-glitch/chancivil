# ChanCivil — Engineering Knowledge. Built for Practice.

Bilingual (English / Khmer) civil and structural engineering education website with a CMS-style admin dashboard.

**Stack:** React · Vite · TypeScript · Tailwind CSS · Lucide icons · Supabase (PostgreSQL, Auth, Storage) · Vercel · GitHub

---

## Current implementation status

| Area | Status |
|---|---|
| Public website (English / Khmer) | Implemented |
| Admin sign-in and password reset | Implemented with Supabase Auth |
| Admin dashboard and role-based navigation | Implemented; enforced by database RLS |
| Articles, resources and categories | Admin create / edit / delete; public pages read published records from Supabase |
| Media library | Uploads to public image storage and private resource storage |
| Contact messages and newsletter subscribers | Supabase-backed; private admin views |
| Website settings and social links | Editable in Admin Control |
| Activity log and user roles | Dashboard views backed by database functions and RLS |

The Admin Control is available at **`/admin`**. It is a private CMS-style workspace rather than a static local editor: published content is saved to Supabase and then displayed by the public website.

If Supabase is not configured, the public site intentionally falls back to bundled sample content and displays a sample-content notice. The admin login explains which environment variables are missing.

---

## Run it on your computer

1. Install **Node.js 20 or newer** from https://nodejs.org (LTS version).
2. Open a terminal in this folder (`chancivil/`) and run:

```bash
npm install
npm run typecheck   # reports any TypeScript errors
npm run dev         # opens a local server, usually http://localhost:5173
```

3. Copy `.env.example` to `.env.local` and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase Project Settings → API. Add your public site URL and social links as needed.
4. Run the SQL migrations and seed script in the order described in `docs/SUPABASE_SETUP.md`, then create your first Super Admin account using that guide.
5. Open `http://localhost:5173/admin` and sign in. Create an article or resource, save it as a draft, then publish it when ready.

If `npm run typecheck` or `npm run build` prints errors, send me the exact text so I can help troubleshoot them.

---

## Before you go live
- Replace `YOUR-DOMAIN.com` in `public/robots.txt` and `public/sitemap.xml` with your real domain.
- Set `VITE_SITE_URL` to your real domain so canonical and share links are correct.
- The sample articles cite codes only at chapter level and do not reproduce clause numbers or tables. Have a licensed engineer review any technical content you publish, and update code editions to the ones used in Cambodia projects you reference.

---

## Folder guide

```
chancivil/
├── public/                 logo, favicon, robots.txt, sitemap.xml
├── src/
│   ├── components/         Navbar, Footer, cards, Seo, forms
│   ├── contexts/           LanguageContext (English/Khmer)
│   ├── data/               sample categories, articles, resources
│   ├── hooks/              useAsync
│   ├── i18n/               translations.ts  (all interface text, EN + KM)
│   ├── layouts/            PublicLayout
│   ├── lib/                supabase client, utilities, site config
│   ├── pages/              Home, Articles, ArticleDetail, Resources, About, Contact, NotFound
│   ├── services/           content.ts  (the only file that reads/writes content)
│   └── types/              shared TypeScript types
├── supabase/
│   ├── migrations/         3 SQL files (run in order)
│   ├── tests/              rls_smoke_test.sql
│   └── seed.sql            generated sample data
├── scripts/                generate-seed.mjs
├── docs/                   SUPABASE_SETUP.md
├── .env.example
└── vercel.json
```

**Where to edit things**
- Interface text (buttons, menus): `src/i18n/translations.ts`
- Sample articles: `src/data/articles.ts`
- Colours: `tailwind.config.js`

## Security notes
- Only the public Supabase **anon** key ever goes in `VITE_` variables. The **service_role** key must never be put in frontend code or committed to GitHub.
- Real access control is enforced by database Row Level Security. Hiding a button is never treated as security.
