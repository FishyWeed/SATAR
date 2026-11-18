import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

// Landing page of the links in the reset and invite emails: it turns the link into a session, then opens `next`.
export const GET: RequestHandler = async ({ url, locals }) => {
	const next = url.searchParams.get('next')?.startsWith('/') ? url.searchParams.get('next')! : '/';
	const code = url.searchParams.get('code'), tokenHash = url.searchParams.get('token_hash'), type = url.searchParams.get('type') as EmailOtpType | null;
	const { error } = code
		? await locals.supabase.auth.exchangeCodeForSession(code)
		: tokenHash && type
			? await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type })
			: { error: new Error('missing code') };
	redirect(303, error ? '/login?link=expired' : next);
};
