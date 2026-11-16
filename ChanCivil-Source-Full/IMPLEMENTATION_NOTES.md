# ChanCivil Admin Control update

## What changed

- Added the private `/admin` route and connected the existing Admin Control dashboard to the app router.
- Connected public article, category and resource pages to Supabase when the project is configured; bundled sample content remains the offline/demo fallback.
- Added dynamic category lookup to article/resource cards and article detail pages.
- Added public image URL resolution and short-lived signed URLs for free resource downloads from private storage.
- Added publishing status and homepage-feature controls to article and resource editors.
- Added direct cover-image upload from the article editor.
- Connected website settings updates to the live public-site settings context.
- Updated setup documentation and the README.

## Before testing / publishing

1. Install dependencies with `npm install`.
2. Create `.env.local` from `.env.example` and add the Supabase project URL and anon/publishable key.
3. Run the three SQL migrations in order, then run `supabase/seed.sql`.
4. Create the first Super Admin using `docs/SUPABASE_SETUP.md`.
5. Add `http://localhost:5173/**` and your deployed domain's `/admin` path to Supabase Auth redirect URLs.
6. Run `npm run typecheck` and `npm run build`, then test `/admin` and all public pages.

## Validation note

A full build could not be run in this environment because npm dependencies were not available from the package registry and were not cached locally. The TypeScript command therefore reported missing React/Vite/Supabase packages; those errors do not validate the application source either way. Run the checks after `npm install` in your environment.

The portfolio reference was supplied as a RAR v5 archive, but no RAR extractor is installed in this environment. The current Admin Control styling and navy/gold visual language were retained from the ChanCivil project itself.
