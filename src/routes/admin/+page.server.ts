import { count, isNotNull } from 'drizzle-orm';
import { db, tool } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [byStatus, byRisk] = await Promise.all([
		db.select({ key: tool.tol_status, n: count() }).from(tool).groupBy(tool.tol_status),
		db.select({ key: tool.tol_risk, n: count() }).from(tool).where(isNotNull(tool.tol_risk)).groupBy(tool.tol_risk)
	]);
	const pick = (rows: { key: string | null; n: number }[], key: string) => rows.find((r) => r.key === key)?.n ?? 0;
	return {
		status: (['Approved', 'Pending', 'Rejected', 'Banned'] as const).map((k) => ({ label: k, n: pick(byStatus, k) })),
		risk: (['Low', 'Medium', 'High'] as const).map((k) => ({ label: k, n: pick(byRisk, k) }))
	};
};
