# Supabase setup (ChanCivil Admin Control + live content)

Follow these steps in order. Screens on supabase.com change from time to time, so menu names may differ slightly. The ideas stay the same.

Total time: about 30 minutes. Cost: the Free plan is enough to start.

---

## 1. Create the project

1. Go to https://supabase.com and sign up (GitHub login is easiest).
2. Click **New project**. Name it `chancivil`.
3. Choose a **region close to your visitors** (for Cambodia, Singapore is usually closest).
4. Create a strong **database password** and save it in a password manager. You need it for backups.
5. Wait 1–2 minutes until the project is ready.

## 2. Create the database (run the SQL files)

Open **SQL Editor** → **New query**. For each file below, in this exact order: open the file on your computer, copy everything, paste it into the editor, click **Run**.

| Order | File | What it does |
|-------|------|--------------|
| 1 | `supabase/migrations/20261106000001_schema.sql` | Creates the 14 tables, rules and helper functions |
| 2 | `supabase/migrations/20261106000002_rls.sql` | Turns on security: who can read/write each table |
| 3 | `supabase/migrations/20261106000003_storage.sql` | Creates the two file buckets and their rules |
| 4 | `supabase/seed.sql` | Adds categories, tags, settings and sample content (optional but recommended) |

Each should end with "Success". If one fails, **stop** and send me the exact error text. Do not run the next file.

> Run each migration only once. Running 1–3 a second time fails with "already exists". That is harmless, but it means they were already applied.

## 3. Run the security test

1. SQL Editor → New query → paste `supabase/tests/rls_smoke_test.sql` → Run.
2. **No error = all checks passed.** An error starting with `FAIL:` means a security rule is not working. Do not go live; send me the message.
3. The test uses temporary fake users and **saves nothing**.

## 4. Lock down sign-ups

Only people you create should be able to log in.

1. **Authentication → Sign In / Providers** (or **Providers → Email**).
2. Turn **off** "Allow new users to sign up".
3. Leave "Confirm email" on.

Even if someone did sign up, they would have no role and could do nothing. Switching sign-ups off removes the risk entirely.

## 5. Create your first Super Admin securely

A role can only be given by an existing Super Admin, so the **first** one is created here by you, directly in the database. Nobody can do this from the website.

1. **Authentication → Users → Add user → Create new user**.
2. Enter your email and a **strong, unique password**. Tick **Auto Confirm User**. Click Create.
3. **SQL Editor** → new query → paste this, **replacing the email with yours**, and Run:

```sql
insert into public.user_roles (user_id, role, can_publish)
select id, 'super_admin', true
from auth.users
where email = 'YOUR-EMAIL@example.com';
```

4. Check it worked. This should return one row showing `super_admin`:

```sql
select u.email, r.role
from public.user_roles r join auth.users u on u.id = r.user_id;
```

5. Add other people later by creating their user the same way (step 1–2), then in the Users and Roles page (Phase 3) assign **Editor** or **Author**. You can also assign a role by SQL with `role` set to `editor` or `author`.

Rules you can rely on (all tested by the security test):
- Nobody can give themselves a role.
- The last Super Admin cannot be removed or demoted.
- Authors cannot publish unless a Super Admin sets `can_publish = true` for them.

## 6. Connect the website to Supabase

1. **Project Settings → API** (or **API Keys**).
2. Copy the **Project URL** and the **anon / publishable** key.
3. In the `chancivil` folder, copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

4. **Never** use or share the `service_role` / **secret** key. The anon/publishable key is designed to be public. The `service_role` key bypasses all security.

With these two values set and the migrations/seed completed, the public website reads published articles, categories and resources from Supabase. The newsletter and contact forms also write to the database. Admin Control is available at `/admin`.

## 7. Check your storage buckets

**Storage** should list two buckets:
- `public-media` (Public): article images, thumbnails, avatars, logo. Images only, max 5 MB.
- `resource-files` (Private): Excel / PDF / Word / ZIP downloads, max 50 MB.

## 8. Tell Supabase your website address

When you deploy (Phase 5), set **Authentication → URL Configuration**:
- **Site URL**: your real domain, for example `https://chancivil.com`
- **Redirect URLs**: add `http://localhost:5173/**` and `https://your-domain/**`

This is needed for the "Forgot password" email link to return to your site. The admin login also uses `/admin` as its reset redirect.

---

## What each role can do

| | Visitor | Author | Editor | Super Admin |
|---|:--:|:--:|:--:|:--:|
| Read published articles and resources | ✔ | ✔ | ✔ | ✔ |
| Download published **free** files | ✔ | ✔ | ✔ | ✔ |
| Subscribe / send a contact message | ✔ | ✔ | ✔ | ✔ |
| Create and edit **own** articles | | ✔ | ✔ | ✔ |
| Publish articles | | only if allowed | ✔ | ✔ |
| Feature articles, edit **any** article | | | ✔ | ✔ |
| Resources, categories, media, uploads | | images for own articles | ✔ | ✔ |
| Dashboard numbers, activity log | | | ✔ | ✔ |
| Subscribers, messages, website settings, users and roles | | | | ✔ |

## Known limits (be aware of these)

- **No CAPTCHA or IP rate limit.** The contact form has a hidden spam trap, strict database checks and a limit of 5 messages per email address per hour. A determined spammer can use many different addresses. Cloudflare Turnstile is the recommended next step (needs a free Cloudflare account; ask me when you want it).
- **Download counter is not rate-limited.** Anyone can inflate a counter by repeating requests.
- **Paid resources** show as listings only. Their files are locked (no visitor can download them) until a payment provider is added.
- **No automatic emails** (newsletter sending, "new message" alerts). Subscribers are stored; sending needs an email service later.
- **Uploaded article HTML is cleaned when displayed**, not when saved. The website always sanitises it before showing.
- **Sample articles have no author account.** The website shows "ChanCivil Editorial" for them.
- New tables you add later need their own policies and grants. Ask me to write them.

---

## Backups

Your content lives in two places and each needs its own backup.

**A. Database (articles, resources, users, settings, subscribers)**

First check what your plan includes under **Database → Backups**. As far as I know the Free plan has no downloadable daily backups, so make your own regularly (weekly is sensible, and always before big changes).

1. **Project Settings → Database → Connection string**: copy the **Session pooler** URI and put your database password in place of `[YOUR-PASSWORD]`.
2. Install the PostgreSQL client tools (`pg_dump`) from https://www.postgresql.org/download/.
3. Run (replace the URI):

```bash
pg_dump "postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:5432/postgres" \
  --schema=public --schema=auth --format=custom --file=chancivil-backup-YYYY-MM-DD.dump
```

4. Store the `.dump` file somewhere safe **outside** your laptop (external drive or cloud storage). Treat it as **private**: it contains subscriber emails and user accounts.

To restore into a fresh Supabase project, create the project, then use `pg_restore` with the new connection string. Ask me for the exact steps when you need them.

**B. Files (images and downloadable resources)**

Dashboard backups of the database do **not** include uploaded files.
- Keep the **original** Excel/PDF files on your own computer. This is the simplest and most reliable backup.
- To export what is online: **Storage → bucket → select files → Download**.

**C. Code**

Your code is backed up on GitHub (Phase 5 explains the GitHub setup).
