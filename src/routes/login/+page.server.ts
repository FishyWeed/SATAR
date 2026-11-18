import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, user } from '#lib/server/db/index.ts';
import { HOME, MSG, field, isEmail, isPassword } from '#lib/rules.ts';
import type { Actions } from './$types';

// Process 1.0: check the format first, then the account with Supabase Auth and USER_T.
export const actions: Actions = {
	default: async ({ request, locals }) => {
		const f = await request.formData(), email = field(f, 'email'), password = String(f.get('password') ?? '');
		if (!isEmail(email)) return fail(400, { email, error: MSG.email });
		if (!isPassword(password)) return fail(400, { email, error: MSG.password });

		const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });
		const [u] = data.user ? await db.select().from(user).where(eq(user.usr_id, data.user.id)) : [];
		if (error || !u?.usr_active) {
			if (data.user) await locals.supabase.auth.signOut();
			return fail(400, { email, error: MSG.login });
		}
		redirect(303, HOME[u.usr_role]);
	}
};
