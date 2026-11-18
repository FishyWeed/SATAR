import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, request, tool } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

// An employee sees only their own requests; any other id answers "Request not found".
export const load: PageServerLoad = async ({ params, locals }) => {
	const id = Number(params.id);
	const [r] = Number.isInteger(id)
		? await db.select().from(request).innerJoin(tool, eq(request.tol_id, tool.tol_id))
				.where(and(eq(request.req_id, id), eq(request.usr_id, member(locals).id)))
		: [];
	if (!r) error(404, 'Request not found');
	return { request: r.request_t, tool: r.tool_t };
};
