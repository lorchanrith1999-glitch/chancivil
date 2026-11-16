-- =============================================================================
-- ChanCivil — security smoke test
-- Run AFTER the 3 migrations (seed is optional). Proves the permission rules work.
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--   * An ERROR that starts with "FAIL:" means a security rule is NOT working. Do not go live.
--   * No error means every check passed.
--   * With the psql program you also see one "PASS:" line per check.
--
-- SAFE TO RUN: everything happens inside one transaction that ends with ROLLBACK.
-- The temporary test users, articles and messages are never saved.
-- =============================================================================

begin;

-- ---- tiny test helpers (removed by the rollback at the end) -----------------
create function public._t_uid(who text) returns uuid language sql immutable as $$
  select case who
    when 'super'   then 'a0000000-0000-0000-0000-000000000001'::uuid
    when 'editor'  then 'a0000000-0000-0000-0000-000000000002'::uuid
    when 'author1' then 'a0000000-0000-0000-0000-000000000003'::uuid  -- author, cannot publish
    when 'author2' then 'a0000000-0000-0000-0000-000000000004'::uuid  -- author, CAN publish
    when 'author3' then 'a0000000-0000-0000-0000-000000000005'::uuid  -- another author
    when 'nobody'  then 'a0000000-0000-0000-0000-000000000006'::uuid  -- logged in, no role
  end
$$;

create function public._t_login(who text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', public._t_uid(who), 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', public._t_uid(who)::text, true);
  execute 'reset role';
  execute 'set local role authenticated';
end $$;

create function public._t_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'reset role';
  execute 'set local role anon';
end $$;

create function public._t_reset() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
end $$;

create function public._t_assert(ok boolean, label text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAIL: %', label; end if;
  raise notice 'PASS: %', label;
end $$;

-- the statement must be rejected with one of the given SQLSTATE codes
create function public._t_blocked(stmt text, codes text[], label text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate = any (codes) then
      raise notice 'PASS: %', label;
      return;
    end if;
    raise exception 'FAIL: % (wrong error: % - %)', label, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL: % (it was allowed but must be blocked)', label;
end $$;

-- run a write and return how many rows it changed
create function public._t_rows(stmt text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute stmt;
  get diagnostics n = row_count;
  return n;
end $$;

create function public._t_count(stmt text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute 'select count(*) from (' || stmt || ') q' into n;
  return n;
end $$;

-- ---- test data (created as the database owner) ------------------------------
insert into auth.users (id, email) values
  (public._t_uid('super'),   'super@test.invalid'),
  (public._t_uid('editor'),  'editor@test.invalid'),
  (public._t_uid('author1'), 'author1@test.invalid'),
  (public._t_uid('author2'), 'author2@test.invalid'),
  (public._t_uid('author3'), 'author3@test.invalid'),
  (public._t_uid('nobody'),  'nobody@test.invalid');

insert into public.user_roles (user_id, role, can_publish) values
  (public._t_uid('super'),   'super_admin', true),
  (public._t_uid('editor'),  'editor',      false),
  (public._t_uid('author1'), 'author',      false),
  (public._t_uid('author2'), 'author',      true),
  (public._t_uid('author3'), 'author',      false);

insert into public.categories (kind, slug, name_en) values
  ('article',  't-art', 'Test article category'),
  ('resource', 't-res', 'Test resource category');

insert into public.articles (slug, title_en, content_en, status, author_id) values
  ('t-pub',       'Published', '<p>x</p>', 'published', public._t_uid('author1')),
  ('t-draft',     'Draft A1',  '',         'draft',     public._t_uid('author1')),
  ('t-a3-draft',  'Draft A3',  '',         'draft',     public._t_uid('author3'));

insert into public.resources (slug, name_en, category_id, file_path, file_format, is_free, status) values
  ('t-free-pub',   'Free published',  (select id from public.categories where slug = 't-res'), 'files/free.pdf',  'pdf',  true,  'published'),
  ('t-free-draft', 'Free draft',      (select id from public.categories where slug = 't-res'), 'files/draft.pdf', 'pdf',  true,  'draft'),
  ('t-paid-pub',   'Paid published',  (select id from public.categories where slug = 't-res'), 'files/paid.xlsx', 'xlsx', false, 'published');

insert into storage.objects (bucket_id, name) values
  ('resource-files', 'files/free.pdf'),
  ('resource-files', 'files/draft.pdf'),
  ('resource-files', 'files/paid.xlsx');

insert into public.subscribers (email) values ('existing@example.com');
insert into public.contact_messages (name, email, message)
  values ('Seed', 'seed@example.com', 'A seed message that is long enough.');
insert into public.website_settings (key, value) values ('t_setting', '"x"'::jsonb);

create table public._t_ids as select slug, id from public.resources;
grant select on public._t_ids to public;

select public._t_assert((select count(*) from public.profiles where id::text like 'a0000000-%') = 6,
  'a profile row is created automatically for every new login');
select public._t_assert((select published_at is not null from public.articles where slug = 't-pub'),
  'published_at is filled in automatically when an article is published');

-- =============================================================================
-- A. VISITORS (not logged in)
-- =============================================================================
select public._t_anon();

select public._t_assert(public._t_count($q$select 1 from public.articles where slug in ('t-pub','t-draft','t-a3-draft')$q$) = 1,
  'visitor sees the published article and NO drafts');
select public._t_blocked('select * from public.subscribers',      array['42501'], 'visitor cannot read subscribers');
select public._t_blocked('select * from public.contact_messages', array['42501'], 'visitor cannot read contact messages');
select public._t_blocked('select * from public.activity_logs',    array['42501'], 'visitor cannot read the activity log');
select public._t_blocked($q$insert into public.articles (slug, title_en) values ('t-hack','x')$q$,
  array['42501'], 'visitor cannot create articles');
select public._t_blocked($q$insert into public.user_roles (user_id, role) values (public._t_uid('nobody'), 'super_admin')$q$,
  array['42501'], 'visitor cannot assign roles');
select public._t_blocked($q$insert into public.website_settings (key, value) values ('hack','1')$q$,
  array['42501'], 'visitor cannot change website settings');

select public._t_assert(public._t_rows($q$insert into public.subscribers (email) values ('  New.Person@Example.com ')$q$) = 1,
  'visitor can subscribe');
select public._t_blocked($q$insert into public.subscribers (email) values ('existing@example.com')$q$,
  array['23505'], 'duplicate subscriber is rejected');
select public._t_blocked($q$insert into public.subscribers (email) values ('not-an-email')$q$,
  array['23514'], 'invalid subscriber email is rejected by the database');

select public._t_assert(public._t_rows($q$insert into public.contact_messages (name, email, message) values ('Visitor','v@example.com','Hello, this is a valid message.')$q$) = 1,
  'visitor can send a contact message');
select public._t_blocked($q$insert into public.contact_messages (name, email, message) values ('V','v@example.com','short')$q$,
  array['23514'], 'too-short contact message is rejected by the database');
select public._t_assert(public._t_rows($q$insert into public.contact_messages (name, email, message)
  select 'Spammer', 'spam@example.com', 'Spam message number ' || g from generate_series(1,5) g$q$) = 5,
  'five messages from one address are accepted');
select public._t_blocked($q$insert into public.contact_messages (name, email, message) values ('Spammer','spam@example.com','Spam message number six')$q$,
  array['P0001'], 'the 6th message from one address within an hour is throttled');

select public._t_assert(public._t_count($q$select 1 from public.resources where slug like 't-%'$q$) = 2,
  'visitor sees published resources (free + paid listing) but not drafts');
select public._t_assert(public._t_count($q$select 1 from public.website_settings where key = 't_setting'$q$) = 1,
  'visitor can read website settings');

select public._t_assert(
  public.record_resource_download((select id from public._t_ids where slug = 't-free-pub')) = 'files/free.pdf',
  'download of a published free resource returns its file path');
select public._t_assert(
  public.record_resource_download((select id from public._t_ids where slug = 't-free-pub')) = 'files/free.pdf',
  'a second download also works');
select public._t_assert(
  public.record_resource_download((select id from public._t_ids where slug = 't-free-draft')) is null,
  'download of a draft resource is refused');
select public._t_assert(
  public.record_resource_download((select id from public._t_ids where slug = 't-paid-pub')) is null,
  'download of a PAID resource is refused');

select public._t_assert(public._t_count($q$select 1 from storage.objects where bucket_id = 'resource-files'$q$) = 1,
  'visitor can see only the FILE of the published free resource (not draft or paid files)');
select public._t_blocked($q$insert into storage.objects (bucket_id, name) values ('public-media','articles/hack.png')$q$,
  array['42501'], 'visitor cannot upload files');

select public._t_reset();
select public._t_assert((select download_count from public.resources where slug = 't-free-pub') = 2,
  'download counter went from 0 to 2');
select public._t_assert((select count(*) from public.resource_downloads) = 2,
  'two download rows recorded');
select public._t_assert((select count(*) from public.activity_logs
   where entity_type = 'resources' and action = 'update'
     and entity_id = (select id::text from public._t_ids where slug = 't-free-pub')) = 0,
  'download counting does not spam the activity log');
select public._t_assert((select count(*) from public.subscribers where email = 'new.person@example.com') = 1,
  'subscriber email was trimmed and lower-cased');

-- =============================================================================
-- B. LOGGED IN, BUT NO ROLE
-- =============================================================================
select public._t_login('nobody');

select public._t_blocked($q$insert into public.articles (slug, title_en) values ('t-nobody','x')$q$,
  array['42501'], 'user without a role cannot create articles');
select public._t_blocked($q$insert into public.user_roles (user_id, role) values (auth.uid(), 'super_admin')$q$,
  array['42501'], 'a user cannot give themselves a role');
select public._t_blocked($q$insert into public.tags (slug, name_en) values ('t-nobody','x')$q$,
  array['42501'], 'user without a role cannot create tags');
select public._t_blocked($q$insert into public.resources (slug, name_en) values ('t-nobody','x')$q$,
  array['42501'], 'user without a role cannot create resources');
select public._t_assert(public._t_count('select 1 from public.subscribers') = 0,
  'user without a role sees zero subscribers');
select public._t_assert(public._t_count('select 1 from public.contact_messages') = 0,
  'user without a role sees zero contact messages');
select public._t_blocked('select public.admin_dashboard_stats()', array['42501'], 'user without a role cannot open dashboard stats');
select public._t_blocked('select * from public.admin_list_users()', array['42501'], 'user without a role cannot list users');
select public._t_assert(public._t_rows($q$update public.profiles set display_name = 'Mine' where id = auth.uid()$q$) = 1,
  'a user can edit their own profile');
select public._t_assert(public._t_rows($q$update public.profiles set display_name = 'Hacked' where id = public._t_uid('editor')$q$) = 0,
  'a user cannot edit someone else''s profile');

-- =============================================================================
-- C. AUTHOR WITHOUT PUBLISH PERMISSION (author1)
-- =============================================================================
select public._t_login('author1');

select public._t_assert(public._t_rows($q$insert into public.articles (slug, title_en) values ('t-a1-new','Mine')$q$) = 1,
  'author can create a draft under their own name');
select public._t_assert((select author_id from public.articles where slug = 't-a1-new') = public._t_uid('author1'),
  'author_id is filled in with the logged-in author');
select public._t_blocked($q$insert into public.articles (slug, title_en, content_en, status) values ('t-a1-pub','x','<p>x</p>','published')$q$,
  array['42501'], 'author without permission cannot create a PUBLISHED article');
select public._t_blocked($q$update public.articles set status = 'published', content_en = '<p>x</p>' where slug = 't-a1-new'$q$,
  array['42501'], 'author without permission cannot publish their draft');
select public._t_blocked($q$insert into public.articles (slug, title_en, featured) values ('t-a1-feat','x', true)$q$,
  array['42501'], 'author cannot create a featured article');
select public._t_blocked($q$update public.articles set featured = true where slug = 't-a1-new'$q$,
  array['42501'], 'author cannot feature an article');
select public._t_blocked($q$insert into public.articles (slug, title_en, author_id) values ('t-a1-other','x', public._t_uid('author3'))$q$,
  array['42501'], 'author cannot create an article under someone else''s name');
select public._t_blocked($q$update public.articles set author_id = public._t_uid('editor') where slug = 't-a1-new'$q$,
  array['42501'], 'author cannot hand their article to another author');
select public._t_assert(public._t_rows($q$update public.articles set title_en = 'Hacked' where slug = 't-a3-draft'$q$) = 0,
  'author cannot edit another author''s draft');
select public._t_assert(public._t_rows($q$update public.articles set title_en = 'Hacked' where slug = 't-pub'$q$) = 0,
  'author without permission cannot edit an already published article');
select public._t_assert(public._t_rows($q$delete from public.articles where slug = 't-pub'$q$) = 0,
  'author cannot delete a published article');
select public._t_assert(public._t_count($q$select 1 from public.articles where slug in ('t-draft','t-a1-new')$q$) = 2,
  'author sees their own drafts');
select public._t_assert(public._t_count($q$select 1 from public.articles where slug = 't-a3-draft'$q$) = 0,
  'author cannot see another author''s draft');
select public._t_assert(public._t_rows($q$update public.user_roles set can_publish = true where user_id = auth.uid()$q$) = 0,
  'author cannot give themselves publishing permission');
select public._t_assert(public._t_rows($q$update public.user_roles set role = 'super_admin' where user_id = auth.uid()$q$) = 0,
  'author cannot promote themselves');
select public._t_assert(public._t_rows($q$delete from public.user_roles where user_id = public._t_uid('super')$q$) = 0,
  'author cannot delete roles');
select public._t_assert(public._t_rows($q$insert into public.tags (slug, name_en) values ('t-tag','Test tag')$q$) = 1,
  'author can add a tag');
select public._t_blocked($q$insert into public.resources (slug, name_en) values ('t-a1-res','x')$q$,
  array['42501'], 'author cannot create resources');
select public._t_blocked($q$insert into public.categories (kind, slug, name_en) values ('article','t-a1-cat','x')$q$,
  array['42501'], 'author cannot create categories');
select public._t_assert(public._t_count('select 1 from public.activity_logs') = 0,
  'author sees no activity log');
select public._t_assert(public._t_rows($q$insert into storage.objects (bucket_id, name, owner_id) values ('public-media','articles/a1.png', auth.uid()::text)$q$) = 1,
  'author can upload an article image');
select public._t_blocked($q$insert into storage.objects (bucket_id, name) values ('public-media','thumbnails/a1.png')$q$,
  array['42501'], 'author cannot upload into the staff thumbnails folder');
select public._t_blocked($q$insert into storage.objects (bucket_id, name) values ('public-media','site/logo.png')$q$,
  array['42501'], 'author cannot replace the site logo');
select public._t_blocked($q$insert into storage.objects (bucket_id, name) values ('resource-files','files/a1.pdf')$q$,
  array['42501'], 'author cannot upload downloadable resource files');
select public._t_assert(public._t_count($q$select 1 from storage.objects where bucket_id = 'resource-files'$q$) = 1,
  'author sees only the public free file in resource-files (no paid or draft files)');
select public._t_assert(public._t_rows($q$delete from public.articles where slug = 't-a1-new'$q$) = 1,
  'author can delete their own draft');

-- =============================================================================
-- D. AUTHOR WITH PUBLISH PERMISSION (author2)
-- =============================================================================
select public._t_login('author2');

select public._t_assert(public._t_rows($q$insert into public.articles (slug, title_en, content_en, status) values ('t-a2-pub','Mine','<p>x</p>','published')$q$) = 1,
  'author with permission can publish');
select public._t_blocked($q$update public.articles set featured = true where slug = 't-a2-pub'$q$,
  array['42501'], 'even a publishing author cannot feature an article');
select public._t_blocked($q$insert into public.articles (slug, title_en, status) values ('t-a2-empty','x','published')$q$,
  array['23514'], 'an article cannot be published with empty content');

-- =============================================================================
-- E. EDITOR
-- =============================================================================
select public._t_login('editor');

select public._t_assert(public._t_rows($q$update public.articles set title_en = 'Edited by editor' where slug = 't-a3-draft'$q$) = 1,
  'editor can edit any article');
select public._t_assert(public._t_rows($q$update public.articles set featured = true where slug = 't-pub'$q$) = 1,
  'editor can feature an article');
select public._t_assert(public._t_rows($q$insert into public.categories (kind, slug, name_en) values ('article','t-new-cat','New')$q$) = 1,
  'editor can create categories');
select public._t_assert(public._t_rows($q$insert into public.resources (slug, name_en, category_id) values ('t-ed-res','Editor resource',(select id from public.categories where slug = 't-res'))$q$) = 1,
  'editor can create resources');
select public._t_blocked($q$insert into public.resources (slug, name_en, category_id) values ('t-bad-cat','x',(select id from public.categories where slug = 't-art'))$q$,
  array['23514'], 'a resource cannot use an article category');
select public._t_blocked($q$update public.resources set status = 'published' where slug = 't-ed-res'$q$,
  array['23514'], 'a free resource cannot be published without a file');
select public._t_assert(public._t_count('select 1 from public.subscribers') = 0,
  'editor cannot see subscribers');
select public._t_assert(public._t_count('select 1 from public.contact_messages') = 0,
  'editor cannot see contact messages');
select public._t_blocked($q$insert into public.website_settings (key, value) values ('t_ed','1')$q$,
  array['42501'], 'editor cannot create website settings');
select public._t_assert(public._t_rows($q$update public.website_settings set value = '"hacked"' where key = 't_setting'$q$) = 0,
  'editor cannot change website settings');
select public._t_blocked($q$insert into public.user_roles (user_id, role) values (public._t_uid('nobody'), 'author')$q$,
  array['42501'], 'editor cannot assign roles');
select public._t_assert(public._t_rows($q$delete from public.user_roles where user_id = public._t_uid('author1')$q$) = 0,
  'editor cannot remove roles');
select public._t_blocked('select * from public.admin_list_users()', array['42501'], 'editor cannot list users');
select public._t_assert((public.admin_dashboard_stats() ->> 'total_articles')::int >= 3,
  'editor can read dashboard stats');
select public._t_assert((public.admin_dashboard_stats() ->> 'total_subscribers') is null,
  'dashboard hides the subscriber count from editors');
select public._t_assert(public._t_count('select 1 from public.activity_logs') > 0,
  'editor can read the activity log');
select public._t_assert(public._t_rows($q$insert into storage.objects (bucket_id, name) values ('resource-files','files/editor.xlsx')$q$) = 1,
  'editor can upload resource files');
select public._t_assert(public._t_rows($q$insert into storage.objects (bucket_id, name) values ('public-media','thumbnails/e.png')$q$) = 1,
  'editor can upload thumbnails');
select public._t_blocked($q$insert into storage.objects (bucket_id, name) values ('public-media','site/logo.png')$q$,
  array['42501'], 'editor cannot replace the site logo');
select public._t_assert(public._t_count($q$select 1 from storage.objects where bucket_id = 'resource-files'$q$) = 4,
  'editor sees every resource file, including paid and draft');

-- =============================================================================
-- F. SUPER ADMIN
-- =============================================================================
select public._t_login('super');

select public._t_assert(public._t_count('select 1 from public.subscribers') >= 2, 'super admin can read subscribers');
select public._t_assert(public._t_count('select 1 from public.contact_messages') >= 1, 'super admin can read contact messages');
select public._t_assert(public._t_rows($q$update public.contact_messages set is_read = true where email = 'seed@example.com'$q$) = 1,
  'super admin can mark a message as read');
select public._t_blocked($q$update public.contact_messages set message = 'tampered message text' where email = 'seed@example.com'$q$,
  array['42501'], 'message text can never be edited, only the read flag');
select public._t_assert(public._t_rows($q$update public.website_settings set value = '"changed"' where key = 't_setting'$q$) = 1,
  'super admin can change website settings');
select public._t_assert(public._t_rows($q$insert into public.user_roles (user_id, role, can_publish) values (public._t_uid('nobody'), 'author', true)$q$) = 1,
  'super admin can assign a role');
select public._t_assert((select granted_by from public.user_roles where user_id = public._t_uid('nobody')) = public._t_uid('super'),
  'the role records who granted it');
select public._t_assert((public.admin_dashboard_stats() ->> 'total_subscribers')::int >= 2,
  'super admin sees the subscriber count');
select public._t_assert((select count(*) from public.admin_list_users() where email like '%@test.invalid') = 6,
  'super admin can list users with e-mail addresses');
select public._t_blocked($q$update public.user_roles set role = 'editor' where user_id = public._t_uid('super')$q$,
  array['23514'], 'the last Super Admin cannot be demoted');
select public._t_blocked($q$delete from public.user_roles where user_id = public._t_uid('super')$q$,
  array['23514'], 'the last Super Admin cannot be removed');
select public._t_assert(public._t_rows($q$update public.user_roles set role = 'super_admin' where user_id = public._t_uid('nobody')$q$) = 1,
  'super admin can promote a second Super Admin');
select public._t_assert(public._t_rows($q$update public.user_roles set role = 'editor' where user_id = public._t_uid('super')$q$) = 1,
  'with two Super Admins one can be demoted');

select public._t_reset();
select 'ALL SECURITY CHECKS PASSED' as result;

rollback;
