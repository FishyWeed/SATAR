import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, organization, user } from '#lib/server/db/index.ts';
import { homeOf } from '#lib/server/auth.ts';
import { MSG, field, isEmail, isPassword } from '#lib/rules.ts';
import type { Actions } from './$types';

// Process 1.0: check the format first, then the account with Supabase Auth and USER_T.
export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const f = await request.formData(), email = field(f, 'email'), password = String(f.get('password') ?? '');
		if (!isEmail(email)) return fail(400, { email, error: MSG.email });
		if (!isPassword(password)) return fail(400, { email, error: MSG.password });

		const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });
		const [r] = data.user ? await db.select().from(user).leftJoin(organization, eq(user.org_id, organization.org_id)).where(eq(user.usr_id, data.user.id)) : [];
		const u = r?.user_t;
		if (error || !u?.usr_active) {
			if (data.user) await locals.supabase.auth.signOut();
			return fail(400, { email, error: MSG.login });
		}
		if (u.org_id && !r.organization_t?.org_active) {
			await locals.supabase.auth.signOut();
			return fail(403, { email, error: 'Your organization is deactivated. Contact the SATAR team.' });
		}
		// After an invite link, go back to it to join.
		const next = url.searchParams.get('next');
		redirect(303, next?.startsWith('/join/') ? next : homeOf({ id: u.usr_id, firstName: '', lastName: '', email, role: u.usr_role, depId: u.dep_id, orgId: u.org_id, orgName: null }));
	}
};
