import { and, eq, inArray, max } from 'drizzle-orm';
import { audit, db } from '#lib/server/db/index.ts';
import { requestRows } from '#lib/server/queries.ts';
import type { PageServerLoad } from './$types';

// The requests with status Pending Reviewer, with the time of the Manager's approval from the audit log.
export const load: PageServerLoad = async () => {
	const rows = await requestRows({ status: 'Pending Reviewer' });
	const approvals = rows.length
		? await db.select({ toolId: audit.tol_id, time: max(audit.aud_time) }).from(audit)
				.where(and(eq(audit.aud_action, 'Manager approved'), inArray(audit.tol_id, rows.map((r) => r.toolId))))
				.groupBy(audit.tol_id)
		: [];
	const approvedAt = new Map(approvals.map((a) => [a.toolId, a.time]));
	return { requests: rows.map((r) => ({ ...r, approvedAt: approvedAt.get(r.toolId) ?? null })) };
};
