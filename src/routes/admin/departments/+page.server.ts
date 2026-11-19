import { fail } from '@sveltejs/kit';
import { and, count, eq, ilike, inArray, ne, sql } from 'drizzle-orm';
import { db, department, user } from '#lib/server/db/index.ts';
import { isUniqueViolation } from '#lib/server/errors.ts';
import { MSG, field, isLength } from '#lib/rules.ts';
import { member } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const org = member(locals).orgId;
	return {
		rows: await db.select({ id: department.dep_id, name: department.dep_name, n: count(user.usr_id) })
			.from(department).leftJoin(user, eq(user.dep_id, department.dep_id))
			.where(eq(department.org_id, org))
			.groupBy(department.dep_id).orderBy(department.dep_name),
		// Every member, for the users list of the Edit popup.
		users: await db.select({ id: user.usr_id, name: sql<string>`${user.usr_f_name} || ' ' || ${user.usr_l_name}`, role: user.usr_role, depId: user.dep_id })
			.from(user).where(eq(user.org_id, org)).orderBy(user.usr_f_name, user.usr_l_name)
	};
};

// Process 7.0: a name of 2 to 50 characters that no other department has.
async function check(orgId: number, name: string, id?: number) {
	if (!isLength(name, 2, 50)) return MSG.nameLength;
	const [same] = await db.select({ id: department.dep_id }).from(department)
		.where(and(eq(department.org_id, orgId), ilike(department.dep_name, name.replace(/[\\%_]/g, '\\$&')), id ? ne(department.dep_id, id) : undefined));
	return same ? MSG.nameExists : '';
}

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const org = member(locals).orgId, name = field(await request.formData(), 'name'), problem = await check(org, name);
		if (problem) return fail(400, { name, error: problem });
		try { await db.insert(department).values({ org_id: org, dep_name: name }); } catch (e) { if (isUniqueViolation(e)) return fail(400, { name, error: MSG.nameExists }); throw e; }
		return { message: MSG.recordSaved };
	},
	// The Edit popup: a new name and the users of the department. A ticked user moves here; an unticked user moves to the chosen department.
	edit: async ({ request, locals }) => {
		const org = member(locals).orgId, f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name'), moveTo = Number(field(f, 'moveTo'));
		const [dep] = Number.isInteger(id) ? await db.select().from(department).where(and(eq(department.dep_id, id), eq(department.org_id, org))) : [];
		if (!dep) return fail(404, { error: 'Department not found' });
		const problem = await check(org, name, id);
		if (problem) return fail(400, { error: `${dep.dep_name}: ${problem}` });
		// Only the organization's own users can be ticked.
		const ids = f.getAll('users').map(String);
		const ticked = ids.length ? (await db.select({ id: user.usr_id }).from(user).where(and(eq(user.org_id, org), inArray(user.usr_id, ids)))).map((u) => u.id) : [];
		const inside = (await db.select({ id: user.usr_id }).from(user).where(eq(user.dep_id, id))).map((u) => u.id);
		const removed = inside.filter((u) => !ticked.includes(u));
		if (removed.length) {
			const [target] = Number.isInteger(moveTo) && moveTo !== id ? await db.select().from(department).where(and(eq(department.dep_id, moveTo), eq(department.org_id, org))) : [];
			if (!target) return fail(400, { error: `${dep.dep_name}: Choose a department for the users that you took out` });
		}
		try {
			await db.transaction(async (tx) => {
				await tx.update(department).set({ dep_name: name }).where(eq(department.dep_id, id));
				if (ticked.length) await tx.update(user).set({ dep_id: id }).where(inArray(user.usr_id, ticked));
				if (removed.length) await tx.update(user).set({ dep_id: moveTo }).where(inArray(user.usr_id, removed));
			});
		} catch (e) {
			if (isUniqueViolation(e)) return fail(400, { error: `${dep.dep_name}: ${MSG.nameExists}` });
			throw e;
		}
		return { message: MSG.recordSaved };
	}
};
