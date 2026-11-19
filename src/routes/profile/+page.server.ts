import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, department } from '#lib/server/db/index.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const depId = locals.user!.depId;
	const [dep] = depId ? await db.select().from(department).where(eq(department.dep_id, depId)) : [];
	return { department: dep?.dep_name ?? '-' };
};

export const actions: Actions = {
	signout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	}
};
