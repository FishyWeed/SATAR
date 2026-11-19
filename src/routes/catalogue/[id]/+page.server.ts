import { error } from '@sveltejs/kit';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { db, tool } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import { categoryNames } from '#lib/server/queries.ts';
import type { PageServerLoad } from './$types';

// A tool of another organization answers "Tool not found", like a tool that does not exist.
export const load: PageServerLoad = async ({ params, locals }) => {
	const me = member(locals), id = Number(params.id);
	const [t] = Number.isInteger(id)
		? await db.select({ ...getTableColumns(tool), categories: categoryNames }).from(tool).where(and(eq(tool.tol_id, id), eq(tool.org_id, me.orgId)))
		: [];
	if (!t) error(404, 'Tool not found');
	return { tool: t };
};
