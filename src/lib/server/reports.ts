import { and, asc, between, desc, eq, lt } from 'drizzle-orm';
import { audit, category, db, department, request, tool, user } from './db/index.ts';
import { MSG, dayEnd, dayStart, fmtDate, fmtTime, isDate, today } from '#lib/rules.ts';

/** Reads ?from=&to= (YYYY-MM-DD). Defaults to the last 30 days. Returns an error message for a bad range. */
export function readRange(url: URL) {
	const now = today(), monthAgo = new Date(Date.parse(now) - 30 * 864e5).toISOString().slice(0, 10);
	const from = url.searchParams.get('from') || monthAgo, to = url.searchParams.get('to') || now;
	return { from, to, error: isDate(from) && isDate(to) && from <= to ? '' : MSG.dateRange };
}

/** Decisions of the organization's audit log in a date range, newest first. */
export function auditRows(orgId: number, from: string, to: string) {
	return db
		.select({ id: audit.aud_id, time: audit.aud_time, first: user.usr_f_name, last: user.usr_l_name, action: audit.aud_action, tool: tool.tol_name, reason: audit.aud_reason })
		.from(audit).innerJoin(user, eq(audit.usr_id, user.usr_id)).innerJoin(tool, eq(audit.tol_id, tool.tol_id))
		.where(and(eq(audit.org_id, orgId), between(audit.aud_time, dayStart(from), dayEnd(to))))
		.orderBy(desc(audit.aud_time));
}

export const REPORTS = { register: 'AI Tool Register Report', overdue: 'Overdue Review Report', audit: 'Audit Log Report', summary: 'Request Summary by Department' } as const;
export type ReportType = keyof typeof REPORTS;

/** The four printed reports of section 7.0.8: column heads, rows and the total row, all as text. */
export async function buildReport(orgId: number, type: ReportType, from: string, to: string): Promise<{ head: string[]; rows: string[][]; total: string[] | null }> {
	if (type === 'register') {
		const rows = await db.select().from(tool).innerJoin(category, eq(tool.cat_id, category.cat_id)).where(eq(tool.org_id, orgId)).orderBy(asc(tool.tol_name));
		return {
			head: ['No.', 'Tool', 'Category', 'Status', 'Risk', 'Data class', 'Review date'],
			rows: rows.map((r, i) => [String(i + 1), r.tool_t.tol_name, r.category_t.cat_name, r.tool_t.tol_status, r.tool_t.tol_risk ?? '-', r.tool_t.tol_data_class ?? '-', fmtDate(r.tool_t.tol_review_date)]),
			total: ['', `Total tools: ${rows.length}`, '', '', '', '', '']
		};
	}
	if (type === 'overdue') {
		const now = today();
		const rows = await db.select().from(tool).where(and(eq(tool.org_id, orgId), eq(tool.tol_status, 'Approved'), lt(tool.tol_review_date, now))).orderBy(asc(tool.tol_review_date));
		return {
			head: ['No.', 'Tool', 'Review date', 'Days overdue', 'Risk', 'Data class'],
			rows: rows.map((t, i) => [String(i + 1), t.tol_name, fmtDate(t.tol_review_date), String(Math.round((Date.parse(now) - Date.parse(t.tol_review_date!)) / 864e5)), t.tol_risk ?? '-', t.tol_data_class ?? '-']),
			total: ['', `Total overdue: ${rows.length}`, '', '', '', '']
		};
	}
	if (type === 'audit') {
		const rows = await auditRows(orgId, from, to);
		return { head: ['No.', 'Date and time', 'User', 'Action', 'Tool', 'Reason'], rows: rows.map((r, i) => [String(i + 1), fmtTime(r.time), `${r.first} ${r.last}`, r.action, r.tool, r.reason]), total: null };
	}
	// Request summary: the requests of each department in the period, counted by result.
	const rows = await db.select({ dep: department.dep_name, status: request.req_status }).from(request)
		.innerJoin(user, eq(request.usr_id, user.usr_id)).innerJoin(department, eq(user.dep_id, department.dep_id))
		.where(and(eq(request.org_id, orgId), between(request.req_date, dayStart(from), dayEnd(to))));
	const byDep = new Map<string, number[]>();
	for (const r of rows) {
		const c = byDep.get(r.dep) ?? [0, 0, 0, 0];
		c[0]++; c[r.status === 'Approved' ? 1 : r.status === 'Rejected' ? 2 : 3]++;
		byDep.set(r.dep, c);
	}
	const list = [...byDep].sort(([a], [b]) => a.localeCompare(b));
	const sum = (k: number) => String(list.reduce((s, [, c]) => s + c[k], 0));
	return {
		head: ['Department', 'Submitted', 'Approved', 'Rejected', 'Pending'],
		rows: list.map(([d, c]) => [d, ...c.map(String)]),
		total: ['Total', sum(0), sum(1), sum(2), sum(3)]
	};
}
