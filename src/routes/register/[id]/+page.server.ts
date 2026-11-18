import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { category, db, tool } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const [t] = Number.isInteger(id)
		? await db.select().from(tool).innerJoin(category, eq(tool.cat_id, category.cat_id)).where(eq(tool.tol_id, id))
		: [];
	if (!t) error(404, 'Tool not found');
	return { tool: { ...t.tool_t, category: t.category_t.cat_name } };
};
