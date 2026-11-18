import { MSG, isEmail } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({ email: url.searchParams.get('email') ?? '' });

export const actions: Actions = {
	// Sends the confirmation email again.
	resend: async ({ locals, url }) => {
		const email = url.searchParams.get('email') ?? '', next = url.searchParams.get('next')?.startsWith('/join/') ? url.searchParams.get('next')! : '/welcome';
		if (!isEmail(email)) return { error: MSG.email };
		const { error } = await locals.supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
		return error ? { error: error.message } : { message: 'The email was sent again' };
	}
};
