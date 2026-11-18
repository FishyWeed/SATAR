import { and, count, desc, eq } from 'drizzle-orm';
import { db, request, tool } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const me = member(locals);
	const [[approved], mine] = await Promise.all([
		db.select({ n: count() }).from(tool).where(and(eq(tool.org_id, me.orgId), eq(tool.tol_status, 'Approved'))),
		db.select({ id: request.req_id, tool: tool.tol_name, date: request.req_date, status: request.req_status })
			.from(request).innerJoin(tool, eq(request.tol_id, tool.tol_id))
			.where(eq(request.usr_id, me.id)).orderBy(desc(request.req_date))
	]);
	return {
		approvedTools: approved.n,
		pending: mine.filter((r) => r.status.startsWith('Pending')).length,
		approvedMine: mine.filter((r) => r.status === 'Approved').length,
		recent: mine.slice(0, 5)
	};
};
