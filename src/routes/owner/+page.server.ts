import { fail, redirect } from '@sveltejs/kit';
import { count, eq, ilike, sql } from 'drizzle-orm';
import { db, organization, user } from '#lib/server/db/index.ts';
import { MSG, field, isLength, likeText } from '#lib/rules.ts';
import { MANAGE_COOKIE } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

// Only the platform Owner, also while managing an organization (the hook also checks this).
const owner = (locals: App.Locals) => { if (locals.user?.role !== 'Owner' && !locals.user?.asOwner) redirect(303, '/'); };

// The Owner sees every organization, its size and its Administrators. To change the data inside one, the Owner manages it.
export const load: PageServerLoad = async ({ locals, url }) => {
	owner(locals);
	const q = (url.searchParams.get('q') ?? '').trim();
	const orgs = await db
		.select({
			id: organization.org_id, name: organization.org_name, active: organization.org_active, created: organization.org_created, users: count(user.usr_id),
			admins: sql<string>`coalesce(string_agg(${user.usr_email}, ', ') filter (where ${user.usr_role} = 'Administrator'), '-')`
		})
		.from(organization).leftJoin(user, eq(user.org_id, organization.org_id))
		.where(q ? ilike(organization.org_name, likeText(q)) : undefined)
		.groupBy(organization.org_id).orderBy(organization.org_name);
	return { q, orgs, totals: { orgs: orgs.length, active: orgs.filter((o) => o.active).length, users: orgs.reduce((n, o) => n + o.users, 0) } };
};

export const actions: Actions = {
	// Deactivate or reactivate an organization. Members of a deactivated organization cannot sign in.
	toggle: async ({ request, locals }) => {
		owner(locals);
		const id = Number(field(await request.formData(), 'id'));
		const [o] = Number.isInteger(id) ? await db.update(organization).set({ org_active: sql`not ${organization.org_active}` }).where(eq(organization.org_id, id)).returning() : [];
		if (!o) return fail(404, { error: 'Organization not found' });
		return { message: `${o.org_name} is now ${o.org_active ? 'active' : 'deactivated'}` };
	},
	// Rename an organization (2 to 80 characters, as on the Welcome page).
	rename: async ({ request, locals }) => {
		owner(locals);
		const f = await request.formData(), id = Number(field(f, 'id')), name = field(f, 'name');
		if (!isLength(name, 2, 80)) return fail(400, { error: 'Enter an organization name of 2 to 80 characters' });
		const [o] = Number.isInteger(id) ? await db.update(organization).set({ org_name: name }).where(eq(organization.org_id, id)).returning() : [];
		if (!o) return fail(404, { error: 'Organization not found' });
		return { message: MSG.recordSaved };
	},
	// Manage an organization: the Owner opens its Administrator pages (users, departments, catalogue, audit log, reports).
	manage: async ({ request, locals, cookies, url }) => {
		owner(locals);
		const id = Number(field(await request.formData(), 'id'));
		const [o] = Number.isInteger(id) ? await db.select({ id: organization.org_id }).from(organization).where(eq(organization.org_id, id)) : [];
		if (!o) return fail(404, { error: 'Organization not found' });
		cookies.set(MANAGE_COOKIE, String(o.id), { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 8 * 3600 });
		redirect(303, '/admin');
	},
	// Stop managing: back to the list of organizations.
	leave: async ({ locals, cookies }) => {
		owner(locals);
		cookies.delete(MANAGE_COOKIE, { path: '/' });
		redirect(303, '/owner');
	}
};
