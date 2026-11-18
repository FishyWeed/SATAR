import { and, count, eq, lt } from 'drizzle-orm';
import { db, tool } from '#lib/server/db/index.ts';
import { requestRows } from '#lib/server/queries.ts';
import { today } from '#lib/rules.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const org = member(locals).orgId;
	const [waiting, [overdue], [banned]] = await Promise.all([
		requestRows({ orgId: org, status: 'Pending Reviewer' }),
		db.select({ n: count() }).from(tool).where(and(eq(tool.org_id, org), eq(tool.tol_status, 'Approved'), lt(tool.tol_review_date, today()))),
		db.select({ n: count() }).from(tool).where(and(eq(tool.org_id, org), eq(tool.tol_status, 'Banned')))
	]);
	return { waiting, overdue: overdue.n, banned: banned.n };
};
