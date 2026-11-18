import { and, eq, ilike } from 'drizzle-orm';
import { category, db, tool } from '#lib/server/db/index.ts';
import { MSG, likeText } from '#lib/rules.ts';
import type { PageServerLoad } from './$types';

// Process 2.0: read the keyword and the category, find the matching tools, show them.
export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get('q') ?? '').trim(), cat = Number(url.searchParams.get('cat')) || 0;
	const categories = await db.select().from(category).orderBy(category.cat_name);
	if (q.length > 50) return { categories, q, cat, tools: [], error: MSG.keyword };
	const tools = await db
		.select({ id: tool.tol_id, name: tool.tol_name, category: category.cat_name, status: tool.tol_status, risk: tool.tol_risk, dataClass: tool.tol_data_class })
		.from(tool).innerJoin(category, eq(tool.cat_id, category.cat_id))
		.where(and(q ? ilike(tool.tol_name, likeText(q)) : undefined, cat ? eq(tool.cat_id, cat) : undefined))
		.orderBy(tool.tol_name);
	return { categories, q, cat, tools, error: tools.length ? '' : MSG.noTool };
};
