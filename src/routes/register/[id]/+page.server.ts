import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { category, db, tool } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

// A tool of another organization answers "Tool not found", like a tool that does not exist.
export const load: PageServerLoad = async ({ params, locals }) => {
	const me = member(locals), id = Number(params.id);
	const [t] = Number.isInteger(id)
		? await db.select().from(tool).innerJoin(category, eq(tool.cat_id, category.cat_id)).where(and(eq(tool.tol_id, id), eq(tool.org_id, me.orgId)))
		: [];
	if (!t) error(404, 'Tool not found');
	return { tool: { ...t.tool_t, category: t.category_t.cat_name } };
};
