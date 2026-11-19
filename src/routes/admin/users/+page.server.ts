import { fail } from '@sveltejs/kit';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db, department, invite, user } from '#lib/server/db/index.ts';
import { member } from '#lib/server/auth.ts';
import { MSG, ROLES, field, isEmail, isLength, oneOf } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

const INVITE_DAYS = 7;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ locals }) => {
	const org = member(locals).orgId;
	const [users, invites, departments] = await Promise.all([
		db.select({ id: user.usr_id, first: user.usr_f_name, last: user.usr_l_name, email: user.usr_email, role: user.usr_role, depId: user.dep_id, department: department.dep_name, active: user.usr_active })
			.from(user).innerJoin(department, eq(user.dep_id, department.dep_id))
			.where(eq(user.org_id, org)).orderBy(user.usr_f_name, user.usr_l_name),
		// Open invites: not used yet and not expired.
		db.select({ id: invite.inv_id, code: invite.inv_code, role: invite.usr_role, department: department.dep_name, email: invite.inv_email, expires: invite.inv_expires })
			.from(invite).innerJoin(department, eq(invite.dep_id, department.dep_id))
			.where(and(eq(invite.org_id, org), isNull(invite.inv_used_by), gt(invite.inv_expires, new Date()))).orderBy(invite.inv_expires),
		db.select().from(department).where(eq(department.org_id, org)).orderBy(department.dep_name)
	]);
	return { users, invites, departments, roles: ROLES };
};

export const actions: Actions = {
	// Creates a single-use invite link for a role and a department, valid for 7 days, optionally for one email id.
	invite: async ({ request, locals, url }) => {
		const me = member(locals), f = await request.formData();
		const role = field(f, 'role'), dep = Number(field(f, 'dep')), email = field(f, 'email').toLowerCase();
		const [d] = Number.isInteger(dep) && dep > 0 ? await db.select().from(department).where(and(eq(department.dep_id, dep), eq(department.org_id, me.orgId))) : [];
		if (!oneOf(ROLES, role) || !d || (email && !isEmail(email))) return fail(400, { error: MSG.fields });
		// 18 random bytes as 36 hex characters: impossible to guess.
		const code = Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(16).padStart(2, '0')).join('');
		await db.insert(invite).values({ inv_code: code, org_id: me.orgId, dep_id: dep, usr_role: role, inv_email: email || null,
			inv_expires: new Date(Date.now() + INVITE_DAYS * 864e5), inv_created_by: me.id });
		return { message: 'Invite created. Copy the link and send it to the person.', link: `${url.origin}/join/${code}` };
	},
	// Process 6.0 in the Edit user popup: all fields are needed; the email id belongs to the person's own account and does not change here.
	edit: async ({ request, locals }) => {
		const me = member(locals), f = await request.formData(), id = field(f, 'id');
		const [old] = UUID.test(id) ? await db.select().from(user).where(and(eq(user.usr_id, id), eq(user.org_id, me.orgId))) : [];
		if (!old) return fail(404, { error: 'User not found' });
		const v = { first: field(f, 'first'), last: field(f, 'last'), role: field(f, 'role'), dep: Number(field(f, 'dep')), active: f.get('active') === 'on' };
		const [dep] = Number.isInteger(v.dep) && v.dep > 0 ? await db.select().from(department).where(and(eq(department.dep_id, v.dep), eq(department.org_id, me.orgId))) : [];
		if (!isLength(v.first, 1, 50) || !isLength(v.last, 1, 50) || !oneOf(ROLES, v.role) || !dep) return fail(400, { error: MSG.fields });
		if (old.usr_id === me.id && (!v.active || v.role !== 'Administrator'))
			return fail(400, { error: 'You cannot deactivate your own account or remove your own Administrator role' });
		await db.update(user).set({ usr_f_name: v.first, usr_l_name: v.last, usr_role: v.role, dep_id: v.dep, usr_active: v.active }).where(eq(user.usr_id, old.usr_id));
		return { message: MSG.userSaved };
	},
	cancel: async ({ request, locals }) => {
		const id = Number(field(await request.formData(), 'id'));
		await db.delete(invite).where(and(eq(invite.inv_id, id), eq(invite.org_id, member(locals).orgId), isNull(invite.inv_used_by)));
		return { message: 'Invite cancelled' };
	}
};
