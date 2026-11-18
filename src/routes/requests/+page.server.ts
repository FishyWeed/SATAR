import { desc, eq } from 'drizzle-orm';
import { db, request, tool } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	requests: await db
		.select({ id: request.req_id, tool: tool.tol_name, date: request.req_date, status: request.req_status, mgrNote: request.req_mgr_note, revNote: request.req_rev_note })
		.from(request).innerJoin(tool, eq(request.tol_id, tool.tol_id))
		.where(eq(request.usr_id, locals.user!.id)).orderBy(desc(request.req_date))
});
