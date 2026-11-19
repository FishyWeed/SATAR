import { fail } from '@sveltejs/kit';
import { and, count, eq, ilike, inArray, ne, sql } from 'drizzle-orm';
import { category, db, tool, toolCategory } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { categoryNames, inCategory } from '#lib/server/queries.ts';
import { MSG, field, isLength, likeText, type ToolStatus } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

const STATUSES: ToolStatus[] = ['Pending', 'Approved', 'Rejected', 'Banned'];
const ADMIN_ONLY = 'Only the Administrator can change categories';
const toolCategoryIds = sql<number[]>`coalesce((select array_agg(tc.cat_id) from tool_category_t tc where tc.tol_id = "tool_t"."tol_id"), '{}')`;

// Process 2.0: the catalogue of the organization for every member. The Tools tab finds tools by keyword, category
// (or "none") and status; the Categories tab lists the categories with their number of tools.
export const load: PageServerLoad = async ({ url, locals }) => {
	const org = member(locals).orgId;
	const view = url.searchParams.get('view') === 'categories' ? 'categories' : 'tools';
	const q = (url.searchParams.get('q') ?? '').trim(), status = url.searchParams.get('status') ?? '';
	const catParam = url.searchParams.get('cat') ?? '';
	const cat = catParam === 'none' ? 'none' : Number(catParam) || 0;
	const [allCategories, allTools] = await Promise.all([
		db.select({ id: category.cat_id, name: category.cat_name }).from(category).where(eq(category.org_id, org)).orderBy(category.cat_name),
		// Every tool with the ids of its categories, for the tick boxes of the category popups.
		db.select({ id: tool.tol_id, name: tool.tol_name, catIds: toolCategoryIds }).from(tool).where(eq(tool.org_id, org)).orderBy(tool.tol_name)
	]);
	const base = { view, q, cat, status, statuses: STATUSES, allCategories, allTools };
	if (q.length > 50) return { ...base, tools: [], categories: [], error: MSG.keyword };
	if (view === 'categories') {
		const categories = await db.select({ id: category.cat_id, name: category.cat_name, n: count(toolCategory.tol_id) })
			.from(category).leftJoin(toolCategory, eq(toolCategory.cat_id, category.cat_id))
			.where(and(eq(category.org_id, org), q ? ilike(category.cat_name, likeText(q)) : undefined))
			.groupBy(category.cat_id).orderBy(category.cat_name);
		return { ...base, tools: [], categories, error: '' };
	}
	const tools = await db
		.select({ id: tool.tol_id, name: tool.tol_name, vendor: tool.tol_vendor, categories: categoryNames, status: tool.tol_status, risk: tool.tol_risk, dataClass: tool.tol_data_class })
		.from(tool)
		.where(and(eq(tool.org_id, org), q ? ilike(tool.tol_name, likeText(q)) : undefined, cat ? inCategory(cat) : undefined,
			STATUSES.includes(status as ToolStatus) ? eq(tool.tol_status, status as ToolStatus) : undefined))
		.orderBy(tool.tol_name);
	return { ...base, tools, categories: [], error: tools.length ? '' : MSG.noTool };
};


// Process 7.0: a name of 2 to 50 characters that no other category of the organization has.
async function check(orgId: number, name: string, id?: number) {
	if (!isLength(name, 2, 50)) return MSG.nameLength;
	const [same] = await db.select({ id: category.cat_id }).from(category)
		.where(and(eq(category.org_id, orgId), ilike(category.cat_name, name.replace(/[\\%_]/g, '\\$&')), id ? ne(category.cat_id, id) : undefined));
	return same ? MSG.nameExists : '';
}

// The ticked tools, kept to the organization's own tools.
async function tickedTools(orgId: number, f: FormData) {
	const ids = f.getAll('tools').map(Number).filter(Number.isInteger);
	return ids.length ? (await db.select({ id: tool.tol_id }).from(tool).where(and(eq(tool.org_id, orgId), inArray(tool.tol_id, ids)))).map((t) => t.id) : [];
}

export const actions: Actions = {
	// The Add category popup: a name and the tools that go into the new category.
	add: async ({ request, locals }) => {
		const me = member(locals);
		if (me.role !== 'Administrator') return fail(403, { error: ADMIN_ONLY });
		const org = me.orgId, f = await request.formData(), name = field(f, 'name'), problem = await check(org, name);
		if (problem) return fail(400, { name, error: problem });
		const ticked = await tickedTools(org, f);
		try {
			await db.transaction(async (tx) => {
				const [c] = await tx.insert(category).values({ org_id: org, cat_name: name }).returning({ id: category.cat_id });
				if (ticked.length) await tx.insert(toolCategory).values(ticked.map((t) => ({ org_id: org, tol_id: t, cat_id: c.id })));
			});
		} catch (e) {
			if (isUniqueViolation(e)) return fail(400, { name, error: MSG.nameExists });
			throw e;
		}
		return { message: MSG.recordSaved };
	},
	// The Edit category popup: a new name and the tools in the category. A tool can be in many categories,
	// so an unticked tool only leaves this category; a tool in no category shows "-".
	edit: async ({ request, locals }) => {
		const me = member(locals);
		if (me.role !== 'Administrator') return fail(403, { error: ADMIN_ONLY });
		const org = me.orgId, f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name');
		const [cat] = Number.isInteger(id) ? await db.select().from(category).where(and(eq(category.cat_id, id), eq(category.org_id, org))) : [];
		if (!cat) return fail(404, { error: 'Category not found' });
		const problem = await check(org, name, id);
		if (problem) return fail(400, { error: `${cat.cat_name}: ${problem}` });
		const ticked = await tickedTools(org, f);
		try {
			await db.transaction(async (tx) => {
				await tx.update(category).set({ cat_name: name }).where(eq(category.cat_id, id));
				await tx.delete(toolCategory).where(eq(toolCategory.cat_id, id));
				if (ticked.length) await tx.insert(toolCategory).values(ticked.map((t) => ({ org_id: org, tol_id: t, cat_id: id })));
			});
		} catch (e) {
			if (isUniqueViolation(e)) return fail(400, { error: `${cat.cat_name}: ${MSG.nameExists}` });
			throw e;
		}
		return { message: MSG.recordSaved };
	}
};
