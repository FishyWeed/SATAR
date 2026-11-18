import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { audit, db, department, request, tool, user } from '#lib/server/db/index.ts';
import { MSG, field, isLength } from '#lib/rules.ts';
import { member } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

// A request of the Manager's own department, or "Request not found".
async function findRequest(id: number, depId: number) {
	const [r] = Number.isInteger(id)
		? await db.select().from(request)
				.innerJoin(tool, eq(request.tol_id, tool.tol_id))
				.innerJoin(user, eq(request.usr_id, user.usr_id))
				.innerJoin(department, eq(user.dep_id, department.dep_id))
				.where(and(eq(request.req_id, id), eq(user.dep_id, depId)))
		: [];
	if (!r) error(404, 'Request not found');
	return r;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const r = await findRequest(Number(params.id), member(locals).depId);
	return { request: r.request_t, tool: r.tool_t, employee: `${r.user_t.usr_f_name} ${r.user_t.usr_l_name}`, department: r.department_t.dep_name };
};

// Process 4.0: a decision needs a reason; the decision and its audit record are saved together.
export const actions: Actions = {
	default: async ({ request: req, params, locals }) => {
		const me = member(locals), r = await findRequest(Number(params.id), me.depId);
		const f = await req.formData(), decision = field(f, 'decision'), reason = field(f, 'reason');
		if (decision !== 'Approve' && decision !== 'Reject') return fail(400, { reason, error: MSG.fields });
		if (!isLength(reason, 1, 500)) return fail(400, { reason, error: MSG.reason });
		if (r.request_t.req_status !== 'Pending Manager') return fail(409, { reason, error: 'This request already has a decision' });

		const saved = await db.transaction(async (tx) => {
			// The status condition stops a second, parallel submit from deciding the same request again.
			const done = await tx.update(request)
				.set({ req_status: decision === 'Approve' ? 'Pending Reviewer' : 'Rejected', req_mgr_note: reason })
				.where(and(eq(request.req_id, r.request_t.req_id), eq(request.req_status, 'Pending Manager')))
				.returning({ id: request.req_id });
			if (!done.length) return false;
			// A tool that only this request brought in leaves the "Pending" state when the Manager rejects it.
			if (decision === 'Reject' && r.tool_t.tol_status === 'Pending')
				await tx.update(tool).set({ tol_status: 'Rejected' }).where(eq(tool.tol_id, r.tool_t.tol_id));
			await tx.insert(audit).values({ org_id: me.orgId, usr_id: me.id, tol_id: r.tool_t.tol_id, aud_action: decision === 'Approve' ? 'Manager approved' : 'Manager rejected', aud_reason: reason });
			return true;
		});
		return saved ? { message: MSG.saved } : fail(409, { reason, error: 'This request already has a decision' });
	}
};
