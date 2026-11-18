import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, department, user } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import { MSG, ROLES, field, isLength, oneOf } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A user of the Administrator's organization, or "User not found". New users join with an invite link.
async function findUser(id: string, orgId: number) {
	const [u] = UUID.test(id) ? await db.select().from(user).where(and(eq(user.usr_id, id), eq(user.org_id, orgId))) : [];
	if (!u) error(404, 'User not found');
	return u;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const me = member(locals);
	return {
		departments: await db.select().from(department).where(eq(department.org_id, me.orgId)).orderBy(department.dep_name),
		roles: ROLES, edited: await findUser(params.id, me.orgId)
	};
};

// Process 6.0: all fields are needed; the email id belongs to the person's own account and does not change here.
export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const me = member(locals), old = await findUser(params.id, me.orgId), f = await request.formData();
		const v = { first: field(f, 'first'), last: field(f, 'last'), role: field(f, 'role'), dep: Number(field(f, 'dep')), active: f.get('active') === 'on' };
		const [dep] = Number.isInteger(v.dep) && v.dep > 0 ? await db.select().from(department).where(and(eq(department.dep_id, v.dep), eq(department.org_id, me.orgId))) : [];
		if (!isLength(v.first, 1, 50) || !isLength(v.last, 1, 50) || !oneOf(ROLES, v.role) || !dep) return fail(400, { ...v, error: MSG.fields });
		if (old.usr_id === me.id && (!v.active || v.role !== 'Administrator'))
			return fail(400, { ...v, error: 'You cannot deactivate your own account or remove your own Administrator role' });
		await db.update(user).set({ usr_f_name: v.first, usr_l_name: v.last, usr_role: v.role, dep_id: v.dep, usr_active: v.active }).where(eq(user.usr_id, old.usr_id));
		return { message: MSG.userSaved };
	}
};
