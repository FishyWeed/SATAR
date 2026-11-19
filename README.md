# SATAR: Shadow AI Tool Approval Register

A web-based register for many organizations, where employees request generative AI tools, a Manager checks the business need, a Reviewer checks the data risk, and every decision goes into an audit log.

Stack: SvelteKit 3 and Svelte 5 (TypeScript), Supabase (PostgreSQL, Auth, Row Level Security), Drizzle ORM, Netlify.

## Roles and pages

| Role | Pages |
| --- | --- |
| Visitor | `/` (landing page), `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/join/[code]` (invite link) |
| New user (no organization yet) | `/welcome`: create an organization (and become its Administrator) or join one with an invite link |
| Every member | `/register` (search the AI tool register), `/register/[id]`, `/profile` |
| Employee | `/employee`, `/requests/new`, `/requests`, `/requests/[id]` |
| Manager | `/manager`, `/manager/requests`, `/manager/requests/[id]`, `/manager/tools` |
| Reviewer | `/reviewer`, `/reviewer/queue`, `/reviewer/queue/[id]`, `/reviewer/overdue` |
| Administrator | `/admin`, `/admin/users` (users and invite links), `/admin/users/[id]`, `/admin/departments`, `/admin/catalogue` (categories and tools), `/admin/audit`, `/admin/reports` |
| Owner (platform) | `/owner`: all organizations, deactivate or reactivate one |

Every organization's rows carry its `org_id`, and every query filters by it. `src/hooks.server.ts` checks the session, the role and the organization before every page. The SQL rules in `drizzle/0003_rls_organizations.sql` also keep organizations apart in the database.

## Design

The pages use the SATAR design system ("Night forest", with a day theme):

- `static/css/satar.css` and `static/js/satar.js`: the design system styles and behaviours (menus, dialogs, password toggles, copy buttons, reveals). `src/app.html` loads them.
- `static/fonts`, `static/img`: DM Serif Display, Geist and Geist Mono; the logos, forest layers and product screens.
- `static/css/landing.css` and `static/js/landing.js`: the landing page only.
- `src/lib/app.css`: page layouts. `src/lib/ui.ts`: icons and badges, rendered on the server.
- `src/lib/*.svelte`: shared parts (`PageHead`, `Field`, `TableWrap`, `Stats`, `Banner`, `Empty`, `DataClasses`, `NameList`).

## Set up

You need Node.js 22 or 24 and a free Supabase project.

1. Install the packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the 4 values from the Supabase dashboard:
   - Project Settings > API: the project URL, the anon key and the service role key.
   - Connect > Transaction pooler: the database connection string (port 6543).

3. Create the tables and the Row Level Security rules:

   ```bash
   npm run db:migrate
   ```

4. In Supabase, open Authentication > URL Configuration:
   - Set Site URL to `http://localhost:8888`.
   - Add `http://localhost:8888/auth/callback` to Redirect URLs (later also your Netlify address).

5. In Supabase, open Authentication > Emails > Templates. So that the links work on any device, change the link in:
   - **Confirm signup** to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/welcome`
   - **Reset Password** to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

6. Start the app, open http://localhost:8888 and click "Get started" to create your account and your organization:

   ```bash
   npm run dev
   ```

7. As the Administrator, add departments, check the categories in the Catalogue, and invite your colleagues from Users > Invite user. For real users, set up an email server in Supabase (Authentication > Emails > SMTP): the built-in email reaches only the project team.

8. Optional: make your account the platform Owner, who sees all organizations: `npm run make-owner -- you@example.com`.

## Other commands

- `npm run check`: type check.
- `npm run build`, then `npm run preview`: production build on port 8888.
- `npm run db:generate`: new migration after a change to `src/lib/server/db/schema.ts`.

## Deploy to Netlify

1. Connect the GitHub repository in Netlify. `netlify.toml` sets the build.
2. Add the 4 variables of `.env` in Site configuration > Environment variables.
3. Add `https://<your-site>.netlify.app/auth/callback` to the Supabase Redirect URLs.
