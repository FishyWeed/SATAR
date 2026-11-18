import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { audit, db, department, request, tool, user } from '#lib/server/db/index.ts';
import { DATA_CLASSES, DECISIONS, MSG, RISKS, field, isDate, isLength, oneOf, today } from '#lib/rules.ts';
import { member } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

async function findRequest(id: number, orgId: number) {
	const [r] = Number.isInteger(id)
		? await db.select().from(request)
				.innerJoin(tool, eq(request.tol_id, tool.tol_id))
				.innerJoin(user, eq(request.usr_id, user.usr_id))
				.innerJoin(department, eq(user.dep_id, department.dep_id))
				.where(and(eq(request.req_id, id), eq(request.org_id, orgId)))
		: [];
	if (!r) error(404, 'Request not found');
	return r;
}

// The Reviewer decides a request that a Manager approved, or re-checks an approved tool whose review date has passed.
const canDecide = (r: Awaited<ReturnType<typeof findRequest>>) =>
	r.request_t.req_status === 'Pending Reviewer' ||
	(r.tool_t.tol_status === 'Approved' && !!r.tool_t.tol_review_date && r.tool_t.tol_review_date < today());

export const load: PageServerLoad = async ({ params, locals }) => {
	const r = await findRequest(Number(params.id), member(locals).orgId);
	return {
		request: r.request_t, tool: r.tool_t, employee: `${r.user_t.usr_f_name} ${r.user_t.usr_l_name}`, department: r.department_t.dep_name,
		canDecide: canDecide(r), risks: RISKS, dataClasses: DATA_CLASSES, decisions: DECISIONS, today: today()
	};
};

const STATUS = { Approve: 'Approved', Reject: 'Rejected', Ban: 'Banned' } as const;
const ACTION = { Approve: 'Reviewer approved', Reject: 'Reviewer rejected', Ban: 'Reviewer banned' } as const;

// Process 5.0: all fields are needed and the review date must be after today. The tool, the request and the
// audit log change together.
export const actions: Actions = {
	default: async ({ request: req, params, locals }) => {
		const me = member(locals), r = await findRequest(Number(params.id), me.orgId);
		const f = await req.formData();
		const v = { risk: field(f, 'risk'), dataClass: field(f, 'dataClass'), conditions: field(f, 'conditions'), reviewDate: field(f, 'reviewDate'), decision: field(f, 'decision'), reason: field(f, 'reason') };
		if (!oneOf(RISKS, v.risk) || !oneOf(DATA_CLASSES, v.dataClass) || !isLength(v.conditions, 1, 500) || !isDate(v.reviewDate) || !oneOf(DECISIONS, v.decision) || !isLength(v.reason, 1, 500))
			return fail(400, { ...v, error: MSG.fields });
		if (v.reviewDate <= today()) return fail(400, { ...v, error: MSG.futureDate });
		if (!canDecide(r)) return fail(409, { ...v, error: 'This request already has a decision' });

		const decision = v.decision, risk = v.risk, dataClass = v.dataClass;
		await db.transaction(async (tx) => {
			await tx.update(tool)
				.set({ tol_risk: risk, tol_data_class: dataClass, tol_conditions: v.conditions, tol_review_date: v.reviewDate, tol_status: STATUS[decision] })
				.where(eq(tool.tol_id, r.tool_t.tol_id));
			await tx.update(request)
				.set({ req_status: decision === 'Approve' ? 'Approved' : 'Rejected', req_rev_note: v.reason })
				.where(and(eq(request.req_id, r.request_t.req_id), eq(request.req_status, 'Pending Reviewer')));
			await tx.insert(audit).values({ org_id: me.orgId, usr_id: me.id, tol_id: r.tool_t.tol_id, aud_action: ACTION[decision], aud_reason: v.reason });
		});
		return { message: MSG.saved };
	}
};
