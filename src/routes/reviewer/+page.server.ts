import { and, count, eq, lt } from 'drizzle-orm';
import { db, tool } from '#lib/server/db/index.ts';
import { requestRows } from '#lib/server/queries.ts';
import { today } from '#lib/rules.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [waiting, [overdue], [banned]] = await Promise.all([
		requestRows({ status: 'Pending Reviewer' }),
		db.select({ n: count() }).from(tool).where(and(eq(tool.tol_status, 'Approved'), lt(tool.tol_review_date, today()))),
		db.select({ n: count() }).from(tool).where(eq(tool.tol_status, 'Banned'))
	]);
	return { waiting, overdue: overdue.n, banned: banned.n };
};
