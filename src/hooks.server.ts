import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { eq } from 'drizzle-orm';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$app/env/public';
import { db, organization, user } from '#lib/server/db/index.ts';
import { homeOf } from '#lib/server/auth.ts';
import type { Role } from '#lib/rules.ts';

// Pages open before sign-in ('/' is the landing page). /reset-password and /join/ also serve signed-in users.
const PUBLIC = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth/', '/join/'];
// Pages for every signed-in user, wherever they are in the sign-up journey.
const ANYONE = ['/profile', '/reset-password', '/auth/', '/join/'];
// Each role area and the only role that may open it. /register is open to every member.
const AREAS: [string, Role][] = [['/employee', 'Employee'], ['/requests', 'Employee'], ['/manager', 'Manager'], ['/reviewer', 'Reviewer'], ['/admin', 'Administrator']];
const under = (path: string, p: string) => path === p || path.startsWith(p.endsWith('/') ? p : p + '/');

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (list) => list.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }))
		}
	});

	// getUser() asks Supabase Auth to verify the session; the cookie alone is not trusted.
	// A deactivated user, or a member of a deactivated organization, counts as signed out.
	event.locals.user = null;
	const { data } = await event.locals.supabase.auth.getUser().catch(() => ({ data: { user: null } }));
	if (data.user) {
		const [r] = await db.select().from(user).leftJoin(organization, eq(user.org_id, organization.org_id)).where(eq(user.usr_id, data.user.id));
		const u = r?.user_t, org = r?.organization_t;
		if (u?.usr_active && (!u.org_id || org?.org_active)) {
			event.locals.user = { id: u.usr_id, firstName: u.usr_f_name, lastName: u.usr_l_name, email: u.usr_email, role: u.usr_role, depId: u.dep_id, orgId: u.org_id, orgName: org?.org_name ?? null };
		}
	}

	const path = event.url.pathname, me = event.locals.user;
	if (!me) {
		if (path !== '/' && !PUBLIC.some((p) => under(path, p))) redirect(303, '/login');
	} else {
		const home = homeOf(me);
		if (path === '/' || under(path, '/login') || under(path, '/signup') || under(path, '/forgot-password')) redirect(303, home);
		if (!ANYONE.some((p) => under(path, p))) {
			if (me.role === 'Owner') { if (!under(path, '/owner')) redirect(303, home); }
			else if (!me.orgId) { if (!under(path, '/welcome')) redirect(303, home); }
			else {
				const area = AREAS.find(([p]) => under(path, p));
				if (under(path, '/welcome') || under(path, '/owner') || (area && area[1] !== me.role)) redirect(303, home);
			}
		}
	}

	return resolve(event, { filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version' });
};
