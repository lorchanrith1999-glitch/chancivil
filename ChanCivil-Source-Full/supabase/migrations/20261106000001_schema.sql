-- =============================================================================
-- ChanCivil — Migration 1 of 3: schema, helper functions, triggers
-- Run order: 20261106000001_schema.sql -> 20261106000002_rls.sql -> 20261106000003_storage.sql
-- Paste each file into Supabase Dashboard -> SQL Editor and click Run.
-- Written for Supabase (PostgreSQL 15+). Safe to read top to bottom.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Types
-- -----------------------------------------------------------------------------
create type public.app_role as enum ('super_admin', 'editor', 'author');
create type public.content_status as enum ('draft', 'published');
create type public.category_kind as enum ('article', 'resource');

-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- 2.1 profiles: public display info for each login. Holds NO email address.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  avatar_path  text,
  bio_en       text not null default '' check (char_length(bio_en) <= 1000),
  bio_km       text not null default '' check (char_length(bio_km) <= 1000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2.2 user_roles: one role per user. Only a Super Admin can change this table.
create table public.user_roles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        public.app_role not null,
  can_publish boolean not null default false, -- only meaningful for 'author'
  granted_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.3 categories: shared by articles and resources, told apart by "kind".
create table public.categories (
  id             uuid primary key default gen_random_uuid(),
  kind           public.category_kind not null,
  slug           text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name_en        text not null check (char_length(name_en) between 1 and 120),
  name_km        text not null default '' check (char_length(name_km) <= 200),
  description_en text not null default '' check (char_length(description_en) <= 500),
  description_km text not null default '' check (char_length(description_km) <= 800),
  icon           text not null default 'book' check (char_length(icon) <= 40),
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (kind, slug)
);

-- 2.4 articles
create table public.articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title_en           text not null check (char_length(title_en) between 1 and 200),
  title_km           text not null default '' check (char_length(title_km) <= 300),
  description_en     text not null default '' check (char_length(description_en) <= 600),
  description_km     text not null default '' check (char_length(description_km) <= 900),
  content_en         text not null default '',   -- rich-text HTML, sanitised when displayed
  content_km         text not null default '',
  cover_image_path   text,                        -- path inside the public-media bucket
  cover_alt_en       text not null default '' check (char_length(cover_alt_en) <= 300),
  cover_alt_km       text not null default '' check (char_length(cover_alt_km) <= 400),
  author_id          uuid references public.profiles (id) on delete set null,
  status             public.content_status not null default 'draft',
  featured           boolean not null default false,
  published_at       timestamptz,
  read_minutes       integer not null default 5 check (read_minutes between 1 and 240),
  code_references    text[] not null default '{}',
  seo_title_en       text not null default '' check (char_length(seo_title_en) <= 120),
  seo_title_km       text not null default '' check (char_length(seo_title_km) <= 200),
  seo_description_en text not null default '' check (char_length(seo_description_en) <= 320),
  seo_description_km text not null default '' check (char_length(seo_description_km) <= 480),
  created_by         uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint articles_published_needs_content
    check (status = 'draft' or char_length(btrim(content_en)) > 0)
);

-- 2.5 article_categories (many-to-many)
create table public.article_categories (
  article_id  uuid not null references public.articles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (article_id, category_id)
);

-- 2.6 tags
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name_en    text not null check (char_length(name_en) between 1 and 60),
  name_km    text not null default '' check (char_length(name_km) <= 120),
  created_at timestamptz not null default now()
);

-- 2.7 article_tags (many-to-many)
create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id     uuid not null references public.tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

-- 2.8 resources (downloadable files; payment-ready but no payment logic yet)
create table public.resources (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  name_en            text not null check (char_length(name_en) between 1 and 200),
  name_km            text not null default '' check (char_length(name_km) <= 300),
  description_en     text not null default '' check (char_length(description_en) <= 2000),
  description_km     text not null default '' check (char_length(description_km) <= 3000),
  category_id        uuid references public.categories (id) on delete restrict,
  thumbnail_path     text,                        -- path inside public-media
  file_path          text,                        -- path inside the PRIVATE resource-files bucket
  file_format        text not null default 'other'
                       check (file_format in ('xlsx', 'xls', 'pdf', 'docx', 'doc', 'zip', 'other')),
  file_size_bytes    bigint check (file_size_bytes is null or file_size_bytes >= 0),
  version            text not null default '1.0' check (char_length(version) between 1 and 20),
  is_free            boolean not null default true,
  price_amount       numeric(10, 2) check (price_amount is null or price_amount >= 0),
  price_currency     text not null default 'USD' check (price_currency ~ '^[A-Z]{3}$'),
  payment_product_id text,                        -- reserved for a future payment provider
  status             public.content_status not null default 'draft',
  featured           boolean not null default false,
  download_count     bigint not null default 0 check (download_count >= 0),
  published_at       timestamptz,
  created_by         uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- A free resource cannot be published without its file.
  constraint resources_free_published_needs_file
    check (status = 'draft' or not is_free or file_path is not null)
);

-- 2.9 media: a record for every uploaded file
create table public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null check (bucket in ('public-media', 'resource-files')),
  path        text not null,
  file_name   text not null check (char_length(file_name) <= 255),
  mime_type   text,
  size_bytes  bigint check (size_bytes is null or size_bytes >= 0),
  alt_en      text not null default '' check (char_length(alt_en) <= 300),
  alt_km      text not null default '' check (char_length(alt_km) <= 400),
  uploaded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (bucket, path)
);

-- 2.10 subscribers: private. Anyone may add themselves; only a Super Admin can read.
create table public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null
               check (char_length(email) <= 254
                      and email = lower(email)
                      and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  language   text not null default 'en' check (language in ('en', 'km')),
  created_at timestamptz not null default now()
);
create unique index subscribers_email_key on public.subscribers (email);

-- 2.11 contact_messages: private. Anyone may send; only a Super Admin can read.
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 2 and 100),
  email      text not null
               check (char_length(email) <= 254
                      and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  subject    text check (subject is null or char_length(subject) <= 200),
  message    text not null check (char_length(btrim(message)) between 10 and 5000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2.12 website_settings: key/value. Public-readable, so NEVER store secrets here.
create table public.website_settings (
  key        text primary key check (key ~ '^[a-z0-9_]+$' and char_length(key) <= 60),
  value      jsonb not null default 'null'::jsonb,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.13 activity_logs: written only by database triggers
create table public.activity_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users (id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- 2.14 resource_downloads: written only by record_resource_download()
create table public.resource_downloads (
  id          bigint generated always as identity primary key,
  resource_id uuid not null references public.resources (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. Indexes (foreign keys and the columns the website filters/sorts on)
-- -----------------------------------------------------------------------------
create index articles_public_idx        on public.articles (status, published_at desc);
create index articles_author_idx        on public.articles (author_id);
create index articles_featured_idx      on public.articles (featured) where featured;
create index article_categories_cat_idx on public.article_categories (category_id);
create index article_tags_tag_idx       on public.article_tags (tag_id);
create index resources_public_idx       on public.resources (status, published_at desc);
create index resources_category_idx     on public.resources (category_id);
create index media_uploaded_by_idx      on public.media (uploaded_by);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
create index contact_messages_email_idx on public.contact_messages (lower(email), created_at desc);
create index activity_logs_created_idx  on public.activity_logs (created_at desc);
create index resource_downloads_res_idx on public.resource_downloads (resource_id, created_at desc);
create index user_roles_role_idx        on public.user_roles (role);

-- -----------------------------------------------------------------------------
-- 4. Role helper functions
--    SECURITY DEFINER so policies can read user_roles without recursion.
--    search_path is locked to '' so nothing can be hijacked.
-- -----------------------------------------------------------------------------
create function public.has_role(r public.app_role)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = r
  );
$$;

create function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select public.has_role('super_admin'); $$;

-- Super Admin or Editor
create function public.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role in ('super_admin', 'editor')
  );
$$;

-- Any of the three roles
create function public.is_content_user()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()));
$$;

-- Staff, or an Author who has been given publishing permission
create function public.can_publish_articles()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid())
      and (role in ('super_admin', 'editor') or (role = 'author' and can_publish))
  );
$$;

-- -----------------------------------------------------------------------------
-- 5. Trigger functions
-- -----------------------------------------------------------------------------

-- 5.1 keep updated_at current
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 5.2 create a profile automatically for every new login. Grants NO role.
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
                  split_part(coalesce(new.email, ''), '@', 1)), 100)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5.3 article rules that cannot be expressed in a policy.
--     When there is no logged-in user (SQL Editor / service role) the checks are
--     skipped, because that is the database owner acting directly.
create function public.articles_guard()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, uid);
    new.author_id  := coalesce(new.author_id, uid);
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  if uid is null then
    return new;
  end if;

  -- Publishing requires permission.
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published')
     and not public.can_publish_articles() then
    raise exception 'You do not have permission to publish articles.' using errcode = '42501';
  end if;

  if not public.is_staff() then
    -- Authors cannot feature articles or hand them to someone else.
    if tg_op = 'INSERT' then
      if new.featured then
        raise exception 'Only editors can feature articles.' using errcode = '42501';
      end if;
      if new.author_id is distinct from uid then
        raise exception 'Authors can only create articles under their own name.' using errcode = '42501';
      end if;
    else
      if new.featured is distinct from old.featured then
        raise exception 'Only editors can feature articles.' using errcode = '42501';
      end if;
      if new.author_id is distinct from old.author_id then
        raise exception 'Only editors can change the author.' using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger articles_guard_trg
  before insert or update on public.articles
  for each row execute function public.articles_guard();

-- 5.4 resource published_at + creator
create function public.resources_guard()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, (select auth.uid()));
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger resources_guard_trg
  before insert or update on public.resources
  for each row execute function public.resources_guard();

-- 5.5 a category must be of the right kind for what it is attached to
create function public.check_category_kind()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  expected public.category_kind := tg_argv[0]::public.category_kind;
  actual   public.category_kind;
begin
  if new.category_id is null then
    return new;
  end if;
  select kind into actual from public.categories where id = new.category_id;
  if actual is distinct from expected then
    raise exception 'Category is not a % category.', expected using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger resources_category_kind_trg
  before insert or update of category_id on public.resources
  for each row execute function public.check_category_kind('resource');

create trigger article_categories_kind_trg
  before insert or update of category_id on public.article_categories
  for each row execute function public.check_category_kind('article');

-- 5.6 role table safety: record who granted a role, and never remove the last Super Admin
create function public.user_roles_guard()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.granted_by := coalesce(new.granted_by, (select auth.uid()));
    return new;
  end if;

  if old.role = 'super_admin'
     and (tg_op = 'DELETE' or new.role is distinct from 'super_admin')
     and not exists (
       select 1 from public.user_roles
       where role = 'super_admin' and user_id <> old.user_id
     ) then
    raise exception 'At least one Super Admin must remain.' using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger user_roles_guard_ins_trg
  before insert on public.user_roles
  for each row execute function public.user_roles_guard();

create trigger user_roles_guard_upd_del_trg
  before update or delete on public.user_roles
  for each row execute function public.user_roles_guard();

-- 5.7 subscriber email: trim and lower-case before the constraint runs
create function public.subscribers_normalize()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

create trigger subscribers_normalize_trg
  before insert on public.subscribers
  for each row execute function public.subscribers_normalize();

-- 5.8 basic server-side spam throttle: max 5 contact messages per email per hour
create function public.contact_messages_throttle()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (
    select count(*) from public.contact_messages
    where lower(email) = lower(new.email) and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Too many messages. Please try again later.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger contact_messages_throttle_trg
  before insert on public.contact_messages
  for each row execute function public.contact_messages_throttle();

-- 5.9 activity log (who did what). Never stores article text or setting values.
create function public.log_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  rec jsonb;
begin
  if tg_op = 'DELETE' then
    rec := to_jsonb(old);
  else
    rec := to_jsonb(new);
  end if;

  -- A download-counter bump is not an editorial change: do not log it.
  if tg_op = 'UPDATE' and tg_table_name = 'resources'
     and (to_jsonb(old) - 'download_count' - 'updated_at') = (to_jsonb(new) - 'download_count' - 'updated_at') then
    return null;
  end if;

  insert into public.activity_logs (user_id, action, entity_type, entity_id, details)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'user_id', rec ->> 'key'),
    jsonb_strip_nulls(jsonb_build_object(
      'label',  coalesce(rec ->> 'title_en', rec ->> 'name_en', rec ->> 'key', rec ->> 'role'),
      'status', rec ->> 'status'
    ))
  );
  return null;
end;
$$;

-- updated_at triggers
create trigger profiles_updated_at         before update on public.profiles         for each row execute function public.set_updated_at();
create trigger user_roles_updated_at       before update on public.user_roles       for each row execute function public.set_updated_at();
create trigger categories_updated_at       before update on public.categories       for each row execute function public.set_updated_at();
create trigger articles_updated_at         before update on public.articles         for each row execute function public.set_updated_at();
create trigger resources_updated_at        before update on public.resources        for each row execute function public.set_updated_at();
create trigger website_settings_updated_at before update on public.website_settings for each row execute function public.set_updated_at();

-- activity log triggers
create trigger articles_log         after insert or update or delete on public.articles         for each row execute function public.log_change();
create trigger resources_log        after insert or update or delete on public.resources        for each row execute function public.log_change();
create trigger categories_log       after insert or update or delete on public.categories       for each row execute function public.log_change();
create trigger user_roles_log       after insert or update or delete on public.user_roles       for each row execute function public.log_change();
create trigger website_settings_log after insert or update or delete on public.website_settings for each row execute function public.log_change();

-- -----------------------------------------------------------------------------
-- 6. Functions the website and dashboard call (RPC)
-- -----------------------------------------------------------------------------

-- 6.1 Public download: checks the resource is published + free, counts it, and
--     returns the storage path so the browser can ask for a short-lived signed URL.
--     Returns NULL when the resource is not downloadable.
--     NOTE: not rate-limited. Anyone can call it repeatedly and inflate the counter.
create function public.record_resource_download(p_resource_id uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_path text;
begin
  select file_path into v_path
  from public.resources
  where id = p_resource_id and status = 'published' and is_free and file_path is not null;

  if v_path is null then
    return null;
  end if;

  insert into public.resource_downloads (resource_id) values (p_resource_id);
  update public.resources set download_count = download_count + 1 where id = p_resource_id;
  return v_path;
end;
$$;

-- 6.2 Dashboard numbers for Super Admin / Editor. Subscribers are Super Admin only.
create function public.admin_dashboard_stats()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'Not authorized.' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_articles',     (select count(*) from public.articles),
    'published_articles', (select count(*) from public.articles where status = 'published'),
    'draft_articles',     (select count(*) from public.articles where status = 'draft'),
    'total_resources',    (select count(*) from public.resources),
    'total_downloads',    (select coalesce(sum(download_count), 0) from public.resources),
    'total_subscribers',  case when public.is_super_admin()
                               then (select count(*) from public.subscribers) end,
    'articles_by_month',  (
      select coalesce(jsonb_agg(jsonb_build_object('month', to_char(m, 'YYYY-MM'), 'count', c) order by m), '[]'::jsonb)
      from (
        select date_trunc('month', published_at) as m, count(*) as c
        from public.articles
        where status = 'published' and published_at >= date_trunc('month', now()) - interval '11 months'
        group by 1
      ) s
    ),
    'downloads_by_month', (
      select coalesce(jsonb_agg(jsonb_build_object('month', to_char(m, 'YYYY-MM'), 'count', c) order by m), '[]'::jsonb)
      from (
        select date_trunc('month', created_at) as m, count(*) as c
        from public.resource_downloads
        where created_at >= date_trunc('month', now()) - interval '11 months'
        group by 1
      ) s
    )
  );
end;
$$;

-- 6.3 Users and Roles page (Super Admin only). Shows e-mail, which profiles do not store.
create function public.admin_list_users()
returns table (
  user_id      uuid,
  email        text,
  display_name text,
  role         public.app_role,
  can_publish  boolean,
  created_at   timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Not authorized.' using errcode = '42501';
  end if;

  return query
    select u.id, u.email::text, p.display_name, r.role, coalesce(r.can_publish, false), u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.user_roles r on r.user_id = u.id
    order by u.created_at;
end;
$$;

-- Function permissions: nothing is callable by default; grant only what is needed.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.has_role(public.app_role)   to anon, authenticated;
grant execute on function public.is_super_admin()            to anon, authenticated;
grant execute on function public.is_staff()                  to anon, authenticated;
grant execute on function public.is_content_user()           to anon, authenticated;
grant execute on function public.can_publish_articles()      to anon, authenticated;
grant execute on function public.record_resource_download(uuid) to anon, authenticated;
grant execute on function public.admin_dashboard_stats()     to authenticated;
grant execute on function public.admin_list_users()          to authenticated;

commit;
