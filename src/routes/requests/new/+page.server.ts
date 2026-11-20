import { fail } from '@sveltejs/kit';
import { and, eq, ilike, inArray, notInArray } from 'drizzle-orm';
import { category, db, request, tool, toolCategory } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { DATA_CLASSES, MSG, field, isLength, isUrl, oneOf } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

// The existing tools an Employee can request: the organization's tools that are not approved (already allowed) or banned.
const requestable = (orgId: number) =>
	db.select({ id: tool.tol_id, name: tool.tol_name, vendor: tool.tol_vendor, status: tool.tol_status }).from(tool)
		.where(and(eq(tool.org_id, orgId), notInArray(tool.tol_status, ['Approved', 'Banned']))).orderBy(tool.tol_name);

// "?tool=<id>" (the Request buttons of the catalogue) opens the form for that existing tool.
export const load: PageServerLoad = async ({ locals, url }) => {
	const org = member(locals).orgId;
	const [categories, tools] = await Promise.all([
		db.select().from(category).where(eq(category.org_id, org)).orderBy(category.cat_name),
		requestable(org)
	]);
	const preset = tools.find((t) => t.id === Number(url.searchParams.get('tool')))?.id ?? 0;
	return { categories, tools, preset, mode: preset ? 'existing' : 'new', dataClasses: DATA_CLASSES };
};

// Process 3.0: validate the request, then save it with the status Pending Manager.
// A new tool must not be in the organization's register yet; it is saved (status Pending) together with the request.
// An existing tool must not be approved or banned, and the Employee must not have an open request for it already.
export const actions: Actions = {
	default: async ({ request: req, locals }) => {
		const me = member(locals), f = await req.formData();
		const mode = field(f, 'mode') === 'existing' ? 'existing' : 'new';
		const v = { mode, tool: Number(field(f, 'tool')), name: field(f, 'name'), vendor: field(f, 'vendor'), url: field(f, 'url'), cat: Number(field(f, 'cat')), purpose: field(f, 'purpose'), dataClass: field(f, 'dataClass') };
		const purposeOk = isLength(v.purpose, 1, 500) && oneOf(DATA_CLASSES, v.dataClass);
		const dataClass = v.dataClass as (typeof DATA_CLASSES)[number];

		if (mode === 'existing') {
			const [t] = Number.isInteger(v.tool) && v.tool > 0
				? await db.select({ id: tool.tol_id, status: tool.tol_status }).from(tool).where(and(eq(tool.tol_id, v.tool), eq(tool.org_id, me.orgId)))
				: [];
			if (!t || !purposeOk) return fail(400, { ...v, error: MSG.fields });
			if (t.status === 'Banned') return fail(400, { ...v, error: MSG.toolBanned });
			if (t.status === 'Approved') return fail(400, { ...v, error: MSG.toolApproved });
			const [open] = await db.select({ id: request.req_id }).from(request)
				.where(and(eq(request.tol_id, t.id), eq(request.usr_id, me.id), inArray(request.req_status, ['Pending Manager', 'Pending Reviewer'])));
			if (open) return fail(400, { ...v, error: MSG.openRequest });
			await db.insert(request).values({ org_id: me.orgId, usr_id: me.id, tol_id: t.id, req_purpose: v.purpose, req_data_class: dataClass });
			return { message: MSG.submitted };
		}

		const [cat] = Number.isInteger(v.cat) && v.cat > 0 ? await db.select().from(category).where(and(eq(category.cat_id, v.cat), eq(category.org_id, me.orgId))) : [];
		if (!isLength(v.name, 2, 60) || !isLength(v.vendor, 1, 60) || !isUrl(v.url) || !cat || !purposeOk)
			return fail(400, { ...v, error: MSG.fields });
		// Exact name, ignoring case: ILIKE without wildcards.
		const [found] = await db.select({ id: tool.tol_id }).from(tool).where(and(eq(tool.org_id, me.orgId), ilike(tool.tol_name, v.name.replace(/[\\%_]/g, '\\$&'))));
		if (found) return fail(400, { ...v, error: MSG.toolExists });
		try {
			await db.transaction(async (tx) => {
				const [t] = await tx.insert(tool).values({ org_id: me.orgId, tol_name: v.name, tol_vendor: v.vendor, tol_url: v.url }).returning({ id: tool.tol_id });
				await tx.insert(toolCategory).values({ org_id: me.orgId, tol_id: t.id, cat_id: v.cat });
				await tx.insert(request).values({ org_id: me.orgId, usr_id: me.id, tol_id: t.id, req_purpose: v.purpose, req_data_class: dataClass });
			});
		} catch (e) {
			if (isUniqueViolation(e)) return fail(400, { ...v, error: MSG.toolExists });
			throw e;
		}
		return { message: MSG.submitted };
	}
};
