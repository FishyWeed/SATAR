import { and, count, eq, gte } from 'drizzle-orm';
import { audit, db } from '#lib/server/db/index.ts';
import { departmentTools, requestRows } from '#lib/server/queries.ts';
import { dayStart, today } from '#lib/rules.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const me = locals.user!, monthStart = dayStart(today().slice(0, 8) + '01');
	const [pending, tools, [rejected]] = await Promise.all([
		requestRows({ depId: me.depId, status: 'Pending Manager' }),
		departmentTools(me.depId),
		db.select({ n: count() }).from(audit).where(and(eq(audit.usr_id, me.id), eq(audit.aud_action, 'Manager rejected'), gte(audit.aud_time, monthStart)))
	]);
	return { pending, toolCount: tools.length, rejected: rejected.n };
};
