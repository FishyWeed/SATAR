import { fail, redirect } from '@sveltejs/kit';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db, department, invite, organization, user } from '#lib/server/db/index.ts';
import { HOME } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

type State = 'notFound' | 'expired' | 'used' | 'signedOut' | 'member' | 'wrongEmail' | 'ready';

// The invite and what the visitor can do with it.
async function check(code: string, me: App.Locals['user']) {
	const [r] = /^[\w-]{10,40}$/.test(code)
		? await db.select().from(invite).innerJoin(organization, eq(invite.org_id, organization.org_id)).innerJoin(department, eq(invite.dep_id, department.dep_id))
				.where(eq(invite.inv_code, code))
		: [];
	const inv = r && { id: r.invite_t.inv_id, org: r.organization_t.org_name, orgId: r.invite_t.org_id, depId: r.invite_t.dep_id, department: r.department_t.dep_name, role: r.invite_t.usr_role, email: r.invite_t.inv_email, expires: r.invite_t.inv_expires };
	const state: State =
		!r || !r.organization_t.org_active ? 'notFound'
		: r.invite_t.inv_used_by ? 'used'
		: r.invite_t.inv_expires <= new Date() ? 'expired'
		: !me ? 'signedOut'
		: me.orgId || me.role === 'Owner' ? 'member'
		: inv!.email && inv!.email !== me.email.toLowerCase() ? 'wrongEmail'
		: 'ready';
	return { state, invite: inv };
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const { state, invite: inv } = await check(params.code, locals.user);
	return { state, code: params.code, invite: inv && state !== 'notFound' ? { org: inv.org, department: inv.department, role: inv.role, expires: inv.expires } : null };
};

export const actions: Actions = {
	// Join: the invite is used once (the inv_used_by condition) and the person gets its organization, department and role.
	default: async ({ params, locals }) => {
		const { state, invite: inv } = await check(params.code, locals.user);
		if (state !== 'ready' || !inv) return fail(400, { error: 'This invite link cannot be used' });
		const me = locals.user!;
		const joined = await db.transaction(async (tx) => {
			const used = await tx.update(invite).set({ inv_used_by: me.id })
				.where(and(eq(invite.inv_id, inv.id), isNull(invite.inv_used_by), gt(invite.inv_expires, new Date()))).returning({ id: invite.inv_id });
			const moved = used.length
				? await tx.update(user).set({ org_id: inv.orgId, dep_id: inv.depId, usr_role: inv.role }).where(and(eq(user.usr_id, me.id), isNull(user.org_id))).returning({ id: user.usr_id })
				: [];
			if (!moved.length) tx.rollback();
			return true;
		}).catch(() => false);
		if (!joined) return fail(409, { error: 'This invite link cannot be used' });
		redirect(303, HOME[inv.role]);
	}
};
