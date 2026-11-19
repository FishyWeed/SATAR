import { fail } from '@sveltejs/kit';
import { and, eq, ilike } from 'drizzle-orm';
import { category, db, request, tool, toolCategory } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { DATA_CLASSES, MSG, field, isLength, isUrl, oneOf } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	categories: await db.select().from(category).where(eq(category.org_id, member(locals).orgId)).orderBy(category.cat_name),
	dataClasses: DATA_CLASSES
});

// Process 3.0: validate the request, reject a tool that is already in the organization's register,
// then save the new tool (status Pending) and the request (status Pending Manager) together.
export const actions: Actions = {
	default: async ({ request: req, locals }) => {
		const me = member(locals), f = await req.formData();
		const v = { name: field(f, 'name'), vendor: field(f, 'vendor'), url: field(f, 'url'), cat: Number(field(f, 'cat')), purpose: field(f, 'purpose'), dataClass: field(f, 'dataClass') };
		const [cat] = Number.isInteger(v.cat) && v.cat > 0 ? await db.select().from(category).where(and(eq(category.cat_id, v.cat), eq(category.org_id, me.orgId))) : [];
		if (!isLength(v.name, 2, 60) || !isLength(v.vendor, 1, 60) || !isUrl(v.url) || !cat || !isLength(v.purpose, 1, 500) || !oneOf(DATA_CLASSES, v.dataClass))
			return fail(400, { ...v, error: MSG.fields });
		const dataClass = v.dataClass;
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
