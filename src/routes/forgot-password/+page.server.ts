import { fail } from '@sveltejs/kit';
import { MSG, field, isEmail } from '#lib/rules.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const email = field(await request.formData(), 'email');
		if (!isEmail(email)) return fail(400, { email, error: MSG.email });
		// The same answer for every email id, so the page cannot show which email ids have an account.
		await locals.supabase.auth.resetPasswordForEmail(email, { redirectTo: `${url.origin}/auth/callback?next=/reset-password` });
		return { message: MSG.resetSent };
	}
};
