import { fail } from '@sveltejs/kit';
import { and, count, eq, ilike, ne } from 'drizzle-orm';
import { db, category, tool } from '#lib/server/db/index.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { MSG, field, isLength } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	rows: await db.select({ id: category.cat_id, name: category.cat_name, n: count(tool.tol_id) })
		.from(category).leftJoin(tool, eq(tool.cat_id, category.cat_id))
		.groupBy(category.cat_id).orderBy(category.cat_name)
});

// Process 7.0: a name of 2 to 50 characters that no other category has.
async function check(name: string, id?: number) {
	if (!isLength(name, 2, 50)) return MSG.nameLength;
	const [same] = await db.select({ id: category.cat_id }).from(category)
		.where(and(ilike(category.cat_name, name.replace(/[\\%_]/g, '\\$&')), id ? ne(category.cat_id, id) : undefined));
	return same ? MSG.nameExists : '';
}

export const actions: Actions = {
	add: async ({ request }) => {
		const name = field(await request.formData(), 'name'), problem = await check(name);
		if (problem) return fail(400, { name, error: problem });
		try { await db.insert(category).values({ cat_name: name }); } catch (e) { if (isUniqueViolation(e)) return fail(400, { name, error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	},
	rename: async ({ request }) => {
		const f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name'), problem = await check(name, id);
		if (problem) return fail(400, { error: problem });
		try { await db.update(category).set({ cat_name: name }).where(eq(category.cat_id, id)); } catch (e) { if (isUniqueViolation(e)) return fail(400, { error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	}
};
