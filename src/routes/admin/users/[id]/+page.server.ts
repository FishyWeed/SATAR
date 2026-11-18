import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, ilike, ne } from 'drizzle-orm';
import { db, department, user } from '#lib/server/db/index.ts';
import { adminAuth } from '#lib/server/admin.ts';
import { MSG, ROLES, field, isEmail, isLength, oneOf } from '#lib/rules.ts';
import type { Actions, PageServerLoad } from './$types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// /admin/users/new adds a user; /admin/users/<usr_id> edits one.
export const load: PageServerLoad = async ({ params, url }) => {
	const departments = await db.select().from(department).orderBy(department.dep_name);
	if (params.id === 'new') return { departments, roles: ROLES, edited: null, saved: false };
	const [u] = UUID.test(params.id) ? await db.select().from(user).where(eq(user.usr_id, params.id)) : [];
	if (!u) error(404, 'User not found');
	return { departments, roles: ROLES, edited: u, saved: url.searchParams.has('saved') };
};

// Process 6.0: all fields are needed, and no two users may share an email id.
export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const isNew = params.id === 'new';
		if (!isNew && !UUID.test(params.id)) error(404, 'User not found');
		const f = await request.formData();
		const v = { first: field(f, 'first'), last: field(f, 'last'), email: field(f, 'email').toLowerCase(), role: field(f, 'role'), dep: Number(field(f, 'dep')), active: f.get('active') === 'on' };
		const [dep] = Number.isInteger(v.dep) && v.dep > 0 ? await db.select().from(department).where(eq(department.dep_id, v.dep)) : [];
		if (!isLength(v.first, 1, 50) || !isLength(v.last, 1, 50) || !isEmail(v.email) || !oneOf(ROLES, v.role) || !dep)
			return fail(400, { ...v, error: MSG.fields });
		const role = v.role;
		const [other] = await db.select({ id: user.usr_id }).from(user)
			.where(and(ilike(user.usr_email, v.email.replace(/[\\%_]/g, '\\$&')), isNew ? undefined : ne(user.usr_id, params.id)));
		if (other) return fail(400, { ...v, error: MSG.emailUsed });
		if (!isNew && params.id === locals.user!.id && (!v.active || role !== 'Administrator'))
			return fail(400, { ...v, error: 'You cannot deactivate your own account or remove your own Administrator role' });

		const row = { usr_f_name: v.first, usr_l_name: v.last, usr_email: v.email, usr_role: role, dep_id: v.dep, usr_active: v.active };
		if (isNew) {
			// The account has no password yet: the new user sets one with "Forgot password?" on the Sign In page.
			// (No invite email here, so adding a user does not depend on the project's email settings.)
			const { data, error: e } = await adminAuth().createUser({ email: v.email, email_confirm: true });
			if (e || !data.user) return fail(400, { ...v, error: e?.code === 'email_exists' ? MSG.emailUsed : (e?.message ?? 'The account could not be created') });
			await db.insert(user).values({ usr_id: data.user.id, ...row });
			redirect(303, `/admin/users/${data.user.id}?saved`);
		}
		const [old] = await db.select().from(user).where(eq(user.usr_id, params.id));
		if (!old) error(404, 'User not found');
		if (old.usr_email !== v.email) {
			const { error: e } = await adminAuth().updateUserById(params.id, { email: v.email, email_confirm: true });
			if (e) return fail(400, { ...v, error: e.code === 'email_exists' ? MSG.emailUsed : e.message });
		}
		await db.update(user).set(row).where(eq(user.usr_id, params.id));
		return { message: MSG.userSaved };
	}
};
