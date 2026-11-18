import { fail } from '@sveltejs/kit';
import { and, count, eq, ilike, ne } from 'drizzle-orm';
import { db, department, user } from '#lib/server/db/index.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { MSG, field, isLength } from '#lib/rules.ts';
import { member } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	rows: await db.select({ id: department.dep_id, name: department.dep_name, n: count(user.usr_id) })
		.from(department).leftJoin(user, eq(user.dep_id, department.dep_id))
		.where(eq(department.org_id, member(locals).orgId))
		.groupBy(department.dep_id).orderBy(department.dep_name)
});

// Process 7.0: a name of 2 to 50 characters that no other department has.
async function check(orgId: number, name: string, id?: number) {
	if (!isLength(name, 2, 50)) return MSG.nameLength;
	const [same] = await db.select({ id: department.dep_id }).from(department)
		.where(and(eq(department.org_id, orgId), ilike(department.dep_name, name.replace(/[\\%_]/g, '\\$&')), id ? ne(department.dep_id, id) : undefined));
	return same ? MSG.nameExists : '';
}

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const org = member(locals).orgId, name = field(await request.formData(), 'name'), problem = await check(org, name);
		if (problem) return fail(400, { name, error: problem });
		try { await db.insert(department).values({ org_id: org, dep_name: name }); } catch (e) { if (isUniqueViolation(e)) return fail(400, { name, error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	},
	rename: async ({ request, locals }) => {
		const org = member(locals).orgId, f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name'), problem = await check(org, name, id);
		if (problem) return fail(400, { error: problem });
		try { await db.update(department).set({ dep_name: name }).where(and(eq(department.dep_id, id), eq(department.org_id, org))); } catch (e) { if (isUniqueViolation(e)) return fail(400, { error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	}
};
