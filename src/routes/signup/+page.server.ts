import { fail, redirect } from '@sveltejs/kit';
import { ilike } from 'drizzle-orm';
import { db, user } from '#lib/server/db/index.ts';
import { MSG, field, isEmail, isLength, isPassword } from '#lib/rules.ts';
import type { Actions } from './$types';

// Sign Up: a person creates an account first; after the email confirmation, they create or join an organization.
export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const f = await request.formData();
		const v = { first: field(f, 'first'), last: field(f, 'last'), email: field(f, 'email').toLowerCase() };
		const password = String(f.get('password') ?? ''), confirm = String(f.get('confirm') ?? '');
		if (!isLength(v.first, 1, 50) || !isLength(v.last, 1, 50)) return fail(400, { ...v, error: MSG.fields });
		if (!isEmail(v.email)) return fail(400, { ...v, error: MSG.email });
		if (!isPassword(password)) return fail(400, { ...v, error: MSG.passwordLength });
		if (password !== confirm) return fail(400, { ...v, error: MSG.passwordMatch });
		const [taken] = await db.select({ id: user.usr_id }).from(user).where(ilike(user.usr_email, v.email.replace(/[\\%_]/g, '\\$&')));
		if (taken) return fail(400, { ...v, error: MSG.emailUsed });

		// After the confirmation link, go to the Welcome page, or back to the invite link that brought the person here.
		const next = url.searchParams.get('next')?.startsWith('/join/') ? url.searchParams.get('next')! : '/welcome';
		const { data, error } = await locals.supabase.auth.signUp({
			email: v.email, password, options: { emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`, data: { first: v.first, last: v.last } }
		});
		// Supabase answers an already registered email with a user that has no identities.
		if (error || !data.user || data.user.identities?.length === 0) return fail(400, { ...v, error: error ? error.message : MSG.emailUsed });
		await db.insert(user).values({ usr_id: data.user.id, usr_f_name: v.first, usr_l_name: v.last, usr_email: v.email }).onConflictDoNothing();
		redirect(303, data.session ? next : `/signup/check-email?email=${encodeURIComponent(v.email)}&next=${encodeURIComponent(next)}`);
	}
};
