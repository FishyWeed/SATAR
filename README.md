# SATAR: Shadow AI Tool Approval Register

A web-based register where employees request generative AI tools, a Manager checks the business need, a Reviewer checks the data risk, and every decision goes into an audit log.

Stack: SvelteKit 3 and Svelte 5 (TypeScript), Supabase (PostgreSQL, Auth, Row Level Security), Drizzle ORM, Netlify.

## Roles and pages

| Role | Pages |
| --- | --- |
| All | `/login`, `/forgot-password`, `/reset-password`, `/profile`, `/register` (search the AI tool register) |
| Employee | `/employee`, `/requests/new`, `/requests`, `/requests/[id]` |
| Manager | `/manager`, `/manager/requests`, `/manager/requests/[id]`, `/manager/tools` |
| Reviewer | `/reviewer`, `/reviewer/queue`, `/reviewer/queue/[id]`, `/reviewer/overdue` |
| Administrator | `/admin`, `/admin/users`, `/admin/users/[id]`, `/admin/departments`, `/admin/categories`, `/admin/audit`, `/admin/reports` |

`src/hooks.server.ts` checks the session and the role before every page. The SQL rules in `drizzle/0001_rls.sql` also protect each table.

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

5. Create the first Administrator:

   ```bash
   npm run first-admin -- you@example.com First Last
   ```

6. Start the app, open http://localhost:8888, click "Forgot password?" and set your password from the email:

   ```bash
   npm run dev
   ```

7. As the Administrator, add departments, categories and the other users. Each new user sets a password with "Forgot password?". For real users, set up an email server in Supabase (Authentication > Emails > SMTP): the built-in email reaches only the project team.

## Other commands

- `npm run check`: type check.
- `npm run build`, then `npm run preview`: production build on port 8888.
- `npm run db:generate`: new migration after a change to `src/lib/server/db/schema.ts`.

## Deploy to Netlify

1. Connect the GitHub repository in Netlify. `netlify.toml` sets the build.
2. Add the 4 variables of `.env` in Site configuration > Environment variables.
3. Add `https://<your-site>.netlify.app/auth/callback` to the Supabase Redirect URLs.
