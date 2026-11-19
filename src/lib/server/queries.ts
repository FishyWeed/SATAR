import { and, countDistinct, desc, eq, sql } from 'drizzle-orm';
import { db, department, request, tool, user } from './db/index.ts';
import type { RequestStatus } from '#lib/rules.ts';

/** Requests of one organization with the requester, the department and the tool, newest first. */
export function requestRows(where: { orgId: number; depId?: number; status?: RequestStatus }) {
	return db
		.select({
			id: request.req_id, date: request.req_date, status: request.req_status, purpose: request.req_purpose, dataClass: request.req_data_class,
			toolId: tool.tol_id, tool: tool.tol_name, employee: user.usr_f_name, employeeLast: user.usr_l_name, department: department.dep_name
		})
		.from(request)
		.innerJoin(tool, eq(request.tol_id, tool.tol_id))
		.innerJoin(user, eq(request.usr_id, user.usr_id))
		.innerJoin(department, eq(user.dep_id, department.dep_id))
		.where(and(eq(request.org_id, where.orgId), where.depId ? eq(user.dep_id, where.depId) : undefined, where.status ? eq(request.req_status, where.status) : undefined))
		.orderBy(desc(request.req_date));
}

/** The tools that the staff of one department requested, with the number of staff for each tool. */
export function departmentTools(orgId: number, depId: number) {
	return db
		.select({ id: tool.tol_id, name: tool.tol_name, status: tool.tol_status, risk: tool.tol_risk, dataClass: tool.tol_data_class, users: countDistinct(request.usr_id) })
		.from(request)
		.innerJoin(tool, eq(request.tol_id, tool.tol_id))
		.innerJoin(user, eq(request.usr_id, user.usr_id))
		.where(and(eq(request.org_id, orgId), eq(user.dep_id, depId)))
		.groupBy(tool.tol_id)
		.orderBy(tool.tol_name);
}

/** The category names of a tool, joined by commas, or "-" for a tool in no category. */
// The outer tool_t column is written in full: Drizzle leaves the table name out of a lone column in sql``, and then
// tc.tol_id would match itself.
export const categoryNames = sql<string>`coalesce((select string_agg(c.cat_name, ', ' order by c.cat_name) from tool_category_t tc
	join category_t c on c.cat_id = tc.cat_id where tc.tol_id = "tool_t"."tol_id"), '-')`;

/** Tools in one category (a cat_id), or in no category ('none'). */
export const inCategory = (cat: number | 'none') =>
	cat === 'none'
		? sql`not exists (select 1 from tool_category_t tc where tc.tol_id = "tool_t"."tol_id")`
		: sql`exists (select 1 from tool_category_t tc where tc.tol_id = "tool_t"."tol_id" and tc.cat_id = ${cat})`;
