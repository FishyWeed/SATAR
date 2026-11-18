import { fail } from '@sveltejs/kit';
import { and, count, eq, ilike, ne } from 'drizzle-orm';
import { db, department, user } from '#lib/server/db/index.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { MSG, field, isLength } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	rows: await db.select({ id: department.dep_id, name: department.dep_name, n: count(user.usr_id) })
		.from(department).leftJoin(user, eq(user.dep_id, department.dep_id))
		.groupBy(department.dep_id).orderBy(department.dep_name)
});

// Process 7.0: a name of 2 to 50 characters that no other department has.
async function check(name: string, id?: number) {
	if (!isLength(name, 2, 50)) return MSG.nameLength;
	const [same] = await db.select({ id: department.dep_id }).from(department)
		.where(and(ilike(department.dep_name, name.replace(/[\\%_]/g, '\\$&')), id ? ne(department.dep_id, id) : undefined));
	return same ? MSG.nameExists : '';
}

export const actions: Actions = {
	add: async ({ request }) => {
		const name = field(await request.formData(), 'name'), problem = await check(name);
		if (problem) return fail(400, { name, error: problem });
		try { await db.insert(department).values({ dep_name: name }); } catch (e) { if (isUniqueViolation(e)) return fail(400, { name, error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	},
	rename: async ({ request }) => {
		const f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name'), problem = await check(name, id);
		if (problem) return fail(400, { error: problem });
		try { await db.update(department).set({ dep_name: name }).where(eq(department.dep_id, id)); } catch (e) { if (isUniqueViolation(e)) return fail(400, { error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	}
};
