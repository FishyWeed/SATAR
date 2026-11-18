import { and, asc, eq, lt, max } from 'drizzle-orm';
import { db, request, tool } from '#lib/server/db/index.ts';
import { today } from '#lib/rules.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

// Approved tools whose review date has passed, oldest first, with the latest request of each tool for the Re-check link.
export const load: PageServerLoad = async ({ locals }) => {
	const now = today();
	const tools = await db
		.select({ id: tool.tol_id, name: tool.tol_name, reviewDate: tool.tol_review_date, risk: tool.tol_risk, lastRequest: max(request.req_id) })
		.from(tool).leftJoin(request, eq(request.tol_id, tool.tol_id))
		.where(and(eq(tool.org_id, member(locals).orgId), eq(tool.tol_status, 'Approved'), lt(tool.tol_review_date, now)))
		.groupBy(tool.tol_id).orderBy(asc(tool.tol_review_date));
	return { tools: tools.map((t) => ({ ...t, daysOverdue: Math.round((Date.parse(now) - Date.parse(t.reviewDate!)) / 864e5) })) };
};
