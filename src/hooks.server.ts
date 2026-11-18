import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { eq } from 'drizzle-orm';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$app/env/public';
import { db, user } from '#lib/server/db/index.ts';
import { HOME, type Role } from '#lib/rules.ts';

// Pages open before sign-in. /reset-password also serves signed-in users (Change password).
const PUBLIC = ['/login', '/forgot-password', '/reset-password', '/auth/'];
// Each role area and the only role that may open it. /register and /profile are open to every signed-in role.
const AREAS: [string, Role][] = [['/employee', 'Employee'], ['/requests', 'Employee'], ['/manager', 'Manager'], ['/reviewer', 'Reviewer'], ['/admin', 'Administrator']];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (list) => list.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }))
		}
	});

	// getUser() asks Supabase Auth to verify the session; the cookie alone is not trusted.
	event.locals.user = null;
	const { data } = await event.locals.supabase.auth.getUser().catch(() => ({ data: { user: null } }));
	if (data.user) {
		const [u] = await db.select().from(user).where(eq(user.usr_id, data.user.id));
		if (u?.usr_active) {
			event.locals.user = { id: u.usr_id, firstName: u.usr_f_name, lastName: u.usr_l_name, email: u.usr_email, role: u.usr_role, depId: u.dep_id };
		}
	}

	const path = event.url.pathname, me = event.locals.user;
	const isPublic = PUBLIC.some((p) => path === p || path.startsWith(p));
	if (!me && !isPublic) redirect(303, '/login');
	if (me && (path === '/login' || path === '/forgot-password' || path === '/')) redirect(303, HOME[me.role]);
	const area = AREAS.find(([p]) => path === p || path.startsWith(p + '/'));
	if (me && area && area[1] !== me.role) redirect(303, HOME[me.role]);

	return resolve(event, { filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version' });
};
