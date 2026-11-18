import { and, countDistinct, desc, eq } from 'drizzle-orm';
import { db, department, request, tool, user } from './db/index.ts';
import type { RequestStatus } from '#lib/rules.ts';

/** Requests with the requester, the department and the tool, newest first. */
export function requestRows(where: { depId?: number; status?: RequestStatus }) {
	return db
		.select({
			id: request.req_id, date: request.req_date, status: request.req_status, purpose: request.req_purpose, dataClass: request.req_data_class,
			toolId: tool.tol_id, tool: tool.tol_name, employee: user.usr_f_name, employeeLast: user.usr_l_name, department: department.dep_name
		})
		.from(request)
		.innerJoin(tool, eq(request.tol_id, tool.tol_id))
		.innerJoin(user, eq(request.usr_id, user.usr_id))
		.innerJoin(department, eq(user.dep_id, department.dep_id))
		.where(and(where.depId ? eq(user.dep_id, where.depId) : undefined, where.status ? eq(request.req_status, where.status) : undefined))
		.orderBy(desc(request.req_date));
}

/** The tools that the staff of one department requested, with the number of staff for each tool. */
export function departmentTools(depId: number) {
	return db
		.select({ id: tool.tol_id, name: tool.tol_name, status: tool.tol_status, risk: tool.tol_risk, dataClass: tool.tol_data_class, users: countDistinct(request.usr_id) })
		.from(request)
		.innerJoin(tool, eq(request.tol_id, tool.tol_id))
		.innerJoin(user, eq(request.usr_id, user.usr_id))
		.where(eq(user.dep_id, depId))
		.groupBy(tool.tol_id)
		.orderBy(tool.tol_name);
}
