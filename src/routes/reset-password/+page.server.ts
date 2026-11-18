import { fail, redirect } from '@sveltejs/kit';
import { MSG, isPassword } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

// Opened from the reset or invite email (through /auth/callback) or from My Profile. It needs a session.
export const load: PageServerLoad = async ({ locals }) => {
	const { data } = await locals.supabase.auth.getUser();
	if (!data.user) redirect(303, '/login?link=expired');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const f = await request.formData(), password = String(f.get('password') ?? ''), confirm = String(f.get('confirm') ?? '');
		if (!isPassword(password)) return fail(400, { error: MSG.passwordLength });
		if (password !== confirm) return fail(400, { error: MSG.passwordMatch });
		const { error } = await locals.supabase.auth.updateUser({ password });
		if (error) return fail(400, { error: error.message });
		await locals.supabase.auth.signOut();
		redirect(303, '/login?reset=1');
	}
};
