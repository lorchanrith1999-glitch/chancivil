-- =============================================================================
-- ChanCivil — Migration 2 of 3: Row Level Security and table permissions
-- Run AFTER 20261106000001_schema.sql
--
-- Who can do what (summary)
--   Visitors (anon)  read published articles/resources, categories, tags, profiles,
--                    website settings. Can ADD a subscriber or a contact message. Nothing else.
--   Author           create/edit own articles (draft only unless can_publish), upload
--                    images for articles, edit own profile.
--   Editor           everything an Author can, plus all articles, resources, categories,
--                    tags, media, featured flag, dashboard stats, activity log.
--   Super Admin      everything, plus subscribers, messages, users/roles, website settings.
--   Nobody can give themselves a role: user_roles can only be changed by a Super Admin,
--   and the first Super Admin is created in the SQL Editor (see docs/SUPABASE_SETUP.md).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Turn RLS on for every table (no policy = no access)
-- -----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.user_roles         enable row level security;
alter table public.categories         enable row level security;
alter table public.articles           enable row level security;
alter table public.article_categories enable row level security;
alter table public.tags               enable row level security;
alter table public.article_tags       enable row level security;
alter table public.resources          enable row level security;
alter table public.media              enable row level security;
alter table public.subscribers        enable row level security;
alter table public.contact_messages   enable row level security;
alter table public.website_settings   enable row level security;
alter table public.activity_logs      enable row level security;
alter table public.resource_downloads enable row level security;

-- -----------------------------------------------------------------------------
-- 2. Table permissions (second lock behind RLS)
--    Start from nothing, then grant only what each role could ever need.
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Visitors
grant select on public.profiles, public.categories, public.tags, public.articles,
                public.article_categories, public.article_tags, public.resources,
                public.website_settings to anon;
grant insert on public.subscribers, public.contact_messages to anon;

-- Logged-in users (RLS below decides which rows)
grant select, insert, update, delete on
  public.profiles, public.user_roles, public.categories, public.articles,
  public.article_categories, public.tags, public.article_tags, public.resources,
  public.media, public.subscribers, public.contact_messages, public.website_settings
  to authenticated;
revoke insert, delete on public.profiles from authenticated;       -- created by trigger only
-- Messages: only the "read" flag may ever be changed.
revoke update on public.contact_messages from authenticated;
grant update (is_read) on public.contact_messages to authenticated;
revoke update on public.subscribers from authenticated;            -- subscribers are never edited
grant select on public.activity_logs, public.resource_downloads to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Policies
-- -----------------------------------------------------------------------------

-- ---- profiles ---------------------------------------------------------------
-- Display names and bios are public (shown on articles). No e-mail is stored here.
create policy profiles_select_all on public.profiles
  for select to anon, authenticated using (true);

create policy profiles_update_own_or_admin on public.profiles
  for update to authenticated
  using      (id = (select auth.uid()) or public.is_super_admin())
  with check (id = (select auth.uid()) or public.is_super_admin());

-- ---- user_roles -------------------------------------------------------------
-- Users can see their own role (the dashboard needs it). Only a Super Admin can change roles.
create policy user_roles_select_own_or_admin on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_super_admin());

create policy user_roles_insert_admin on public.user_roles
  for insert to authenticated with check (public.is_super_admin());

create policy user_roles_update_admin on public.user_roles
  for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy user_roles_delete_admin on public.user_roles
  for delete to authenticated using (public.is_super_admin());

-- ---- categories -------------------------------------------------------------
create policy categories_select_all on public.categories
  for select to anon, authenticated using (true);

create policy categories_insert_staff on public.categories
  for insert to authenticated with check (public.is_staff());
create policy categories_update_staff on public.categories
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy categories_delete_staff on public.categories
  for delete to authenticated using (public.is_staff());

-- ---- tags -------------------------------------------------------------------
create policy tags_select_all on public.tags
  for select to anon, authenticated using (true);

-- Authors need to add tags while writing, so any role may create one.
create policy tags_insert_content_user on public.tags
  for insert to authenticated with check (public.is_content_user());
create policy tags_update_staff on public.tags
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy tags_delete_staff on public.tags
  for delete to authenticated using (public.is_staff());

-- ---- articles ---------------------------------------------------------------
-- Visitors: only published articles whose publish date has arrived.
create policy articles_select_published on public.articles
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy articles_select_staff on public.articles
  for select to authenticated using (public.is_staff());

create policy articles_select_own on public.articles
  for select to authenticated
  using (author_id = (select auth.uid()) and public.is_content_user());

-- Extra rules (publishing permission, featured flag, author change) live in articles_guard().
create policy articles_insert on public.articles
  for insert to authenticated
  with check (
    public.is_staff()
    or (author_id = (select auth.uid()) and public.is_content_user())
  );

-- An Author may edit their own article while it is a draft, or any time if allowed to publish.
create policy articles_update on public.articles
  for update to authenticated
  using (
    public.is_staff()
    or (
      author_id = (select auth.uid()) and public.is_content_user()
      and (status = 'draft' or public.can_publish_articles())
    )
  )
  with check (
    public.is_staff()
    or (author_id = (select auth.uid()) and public.is_content_user())
  );

-- An Author may delete only their own drafts.
create policy articles_delete on public.articles
  for delete to authenticated
  using (
    public.is_staff()
    or (author_id = (select auth.uid()) and public.is_content_user() and status = 'draft')
  );

-- ---- article_categories / article_tags -------------------------------------
-- Visible exactly when the parent article is visible to the caller (articles RLS applies inside).
create policy article_categories_select on public.article_categories
  for select to anon, authenticated
  using (exists (select 1 from public.articles a where a.id = article_id));

create policy article_categories_write on public.article_categories
  for all to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.articles a
               where a.id = article_id and a.author_id = (select auth.uid()) and public.is_content_user())
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.articles a
               where a.id = article_id and a.author_id = (select auth.uid()) and public.is_content_user())
  );

create policy article_tags_select on public.article_tags
  for select to anon, authenticated
  using (exists (select 1 from public.articles a where a.id = article_id));

create policy article_tags_write on public.article_tags
  for all to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.articles a
               where a.id = article_id and a.author_id = (select auth.uid()) and public.is_content_user())
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.articles a
               where a.id = article_id and a.author_id = (select auth.uid()) and public.is_content_user())
  );

-- ---- resources --------------------------------------------------------------
-- Published listings (free AND paid) are public so paid products can be shown.
-- A paid resource's FILE is never public: see storage policies in migration 3.
create policy resources_select_published on public.resources
  for select to anon, authenticated using (status = 'published');

create policy resources_select_staff on public.resources
  for select to authenticated using (public.is_staff());

create policy resources_insert_staff on public.resources
  for insert to authenticated with check (public.is_staff());
create policy resources_update_staff on public.resources
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy resources_delete_staff on public.resources
  for delete to authenticated using (public.is_staff());

-- ---- media ------------------------------------------------------------------
create policy media_select on public.media
  for select to authenticated
  using (
    public.is_staff()
    or (uploaded_by = (select auth.uid()) and public.is_content_user())
  );

create policy media_insert on public.media
  for insert to authenticated
  with check (
    public.is_content_user()
    and uploaded_by = (select auth.uid())
    and (bucket = 'public-media' or public.is_staff())
  );

create policy media_update_staff on public.media
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy media_delete on public.media
  for delete to authenticated
  using (
    public.is_staff()
    or (uploaded_by = (select auth.uid()) and public.is_content_user())
  );

-- ---- subscribers ------------------------------------------------------------
-- Anyone may subscribe. Nobody except a Super Admin can read, export or delete the list.
create policy subscribers_insert_anyone on public.subscribers
  for insert to anon, authenticated with check (true);

create policy subscribers_select_admin on public.subscribers
  for select to authenticated using (public.is_super_admin());

create policy subscribers_delete_admin on public.subscribers
  for delete to authenticated using (public.is_super_admin());

-- ---- contact_messages -------------------------------------------------------
create policy contact_messages_insert_anyone on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy contact_messages_select_admin on public.contact_messages
  for select to authenticated using (public.is_super_admin());

create policy contact_messages_update_admin on public.contact_messages
  for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy contact_messages_delete_admin on public.contact_messages
  for delete to authenticated using (public.is_super_admin());

-- ---- website_settings -------------------------------------------------------
-- Public (the site reads social links and title). Only a Super Admin can change.
create policy website_settings_select_all on public.website_settings
  for select to anon, authenticated using (true);

create policy website_settings_insert_admin on public.website_settings
  for insert to authenticated with check (public.is_super_admin());
create policy website_settings_update_admin on public.website_settings
  for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
create policy website_settings_delete_admin on public.website_settings
  for delete to authenticated using (public.is_super_admin());

-- ---- activity_logs / resource_downloads ------------------------------------
-- Read-only for staff. Rows are written only by trigger / function code (no insert policy).
create policy activity_logs_select_staff on public.activity_logs
  for select to authenticated using (public.is_staff());

create policy resource_downloads_select_staff on public.resource_downloads
  for select to authenticated using (public.is_staff());

commit;
