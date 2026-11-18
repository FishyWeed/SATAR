import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, department } from '#lib/server/db/index.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [dep] = await db.select().from(department).where(eq(department.dep_id, locals.user!.depId));
	return { department: dep?.dep_name ?? '-' };
};

export const actions: Actions = {
	signout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/login');
	}
};
