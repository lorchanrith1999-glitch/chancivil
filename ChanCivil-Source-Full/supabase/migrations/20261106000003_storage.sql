-- =============================================================================
-- ChanCivil — Migration 3 of 3: Storage buckets and access rules
-- Run AFTER 20261106000002_rls.sql
--
-- Two buckets:
--   public-media    PUBLIC.  Article images, thumbnails, avatars, logo. Anyone with the
--                   link can view. Images only, max 5 MB.
--   resource-files  PRIVATE. Excel / PDF / Word / ZIP downloads, max 50 MB.
--                   A file can be downloaded by visitors ONLY while its resource is
--                   published AND free. Paid files stay locked until a payment
--                   provider is added.
--
-- Upload folders (enforced below):
--   public-media/articles, editor, avatars  -> any role
--   public-media/thumbnails, media          -> Super Admin, Editor
--   public-media/site                       -> Super Admin (logo)
--   resource-files/files                    -> Super Admin, Editor
-- SVG is deliberately not allowed for uploads (SVG files can carry scripts).
-- =============================================================================

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('resource-files', 'resource-files', false, 52428800,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/zip',
      'application/x-zip-compressed'
    ])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---- public-media -----------------------------------------------------------
-- Viewing a public bucket file by URL needs no policy. This one lets the dashboard LIST files.
create policy "public-media: list own or all"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'public-media'
    and (public.is_staff() or owner_id = (select auth.uid())::text)
  );

create policy "public-media: upload by role and folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (
      ((storage.foldername(name))[1] in ('articles', 'editor', 'avatars') and public.is_content_user())
      or ((storage.foldername(name))[1] in ('thumbnails', 'media') and public.is_staff())
      or ((storage.foldername(name))[1] = 'site' and public.is_super_admin())
    )
  );

create policy "public-media: replace own or staff"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'public-media'
    and (public.is_staff() or owner_id = (select auth.uid())::text)
  );

create policy "public-media: delete own or staff"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'public-media'
    and (public.is_staff() or owner_id = (select auth.uid())::text)
  );

-- ---- resource-files ---------------------------------------------------------
-- Staff can see every file (to manage and preview, including paid ones).
create policy "resource-files: staff read all"
  on storage.objects for select to authenticated
  using (bucket_id = 'resource-files' and public.is_staff());

-- Visitors: only the file of a published, FREE resource (needed to create a signed URL).
create policy "resource-files: public read free published"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'resource-files'
    and exists (
      select 1 from public.resources r
      where r.file_path = name and r.status = 'published' and r.is_free
    )
  );

create policy "resource-files: staff upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] = 'files'
    and public.is_staff()
  );

create policy "resource-files: staff replace"
  on storage.objects for update to authenticated
  using (bucket_id = 'resource-files' and public.is_staff());

create policy "resource-files: staff delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resource-files' and public.is_staff());

commit;
