import { fail } from '@sveltejs/kit';
import { and, count, eq, ilike, inArray, ne } from 'drizzle-orm';
import { category, db, tool } from '#lib/server/db/index.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { MSG, field, isLength, likeText, type ToolStatus } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

const STATUSES: ToolStatus[] = ['Pending', 'Approved', 'Rejected', 'Banned'];

// The catalogue: categories and tools, filtered by a keyword (both lists), a category and a status (tools).
export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get('q') ?? '').trim(), cat = Number(url.searchParams.get('cat')) || 0, status = url.searchParams.get('status') ?? '';
	const [categories, tools, allTools] = await Promise.all([
		db.select({ id: category.cat_id, name: category.cat_name, n: count(tool.tol_id) })
			.from(category).leftJoin(tool, eq(tool.cat_id, category.cat_id))
			.where(q ? ilike(category.cat_name, likeText(q)) : undefined)
			.groupBy(category.cat_id).orderBy(category.cat_name),
		db.select({ id: tool.tol_id, name: tool.tol_name, vendor: tool.tol_vendor, category: category.cat_name, status: tool.tol_status, risk: tool.tol_risk, dataClass: tool.tol_data_class })
			.from(tool).innerJoin(category, eq(tool.cat_id, category.cat_id))
			.where(and(q ? ilike(tool.tol_name, likeText(q)) : undefined, cat ? eq(tool.cat_id, cat) : undefined,
				STATUSES.includes(status as ToolStatus) ? eq(tool.tol_status, status as ToolStatus) : undefined))
			.orderBy(tool.tol_name),
		// Every tool, for the tick boxes of the edit popup.
		db.select({ id: tool.tol_id, name: tool.tol_name, catId: tool.cat_id }).from(tool).orderBy(tool.tol_name)
	]);
	const allCategories = await db.select({ id: category.cat_id, name: category.cat_name }).from(category).orderBy(category.cat_name);
	return { q, cat, status, statuses: STATUSES, categories, tools, allTools, allCategories };
};

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
		try {
			await db.insert(category).values({ cat_name: name });
		} catch (e) {
			if (isUniqueViolation(e)) return fail(400, { name, error: MSG.nameExists });
			throw e;
		}
		return { message: MSG.recordSaved };
	},
	// Edit a category: its name and the tools in it. A tool belongs to exactly one category, so the tools
	// that are taken out of this category move to the category in `moveTo`.
	edit: async ({ request }) => {
		const f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name');
		const ticked = f.getAll('tools').map(Number).filter(Number.isInteger), moveTo = Number(field(f, 'moveTo'));
		const [cat] = Number.isInteger(id) ? await db.select().from(category).where(eq(category.cat_id, id)) : [];
		if (!cat) return fail(404, { error: 'Category not found' });
		const problem = await check(name, id);
		if (problem) return fail(400, { error: `${cat.cat_name}: ${problem}` });
		const inside = (await db.select({ id: tool.tol_id }).from(tool).where(eq(tool.cat_id, id))).map((t) => t.id);
		const removed = inside.filter((t) => !ticked.includes(t));
		if (removed.length) {
			const [target] = Number.isInteger(moveTo) && moveTo !== id ? await db.select().from(category).where(eq(category.cat_id, moveTo)) : [];
			if (!target) return fail(400, { error: `${cat.cat_name}: Choose a category for the tools that you took out` });
		}
		try {
			await db.transaction(async (tx) => {
				await tx.update(category).set({ cat_name: name }).where(eq(category.cat_id, id));
				if (ticked.length) await tx.update(tool).set({ cat_id: id }).where(inArray(tool.tol_id, ticked));
				if (removed.length) await tx.update(tool).set({ cat_id: moveTo }).where(inArray(tool.tol_id, removed));
			});
		} catch (e) {
			if (isUniqueViolation(e)) return fail(400, { error: `${cat.cat_name}: ${MSG.nameExists}` });
			throw e;
		}
		return { message: MSG.recordSaved };
	}
};
