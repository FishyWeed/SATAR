import { fail, redirect } from '@sveltejs/kit';
import { count, eq, ilike, sql } from 'drizzle-orm';
import { db, organization, user } from '#lib/server/db/index.ts';
import { field, likeText } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

// Only the platform Owner (the hook also checks this).
const owner = (locals: App.Locals) => { if (locals.user?.role !== 'Owner') redirect(303, '/'); };

// The Owner sees every organization, its size and its Administrators, but no data inside it.
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
	}
};
