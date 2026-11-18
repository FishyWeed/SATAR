import { fail, redirect } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { category, db, department, organization, user } from '#lib/server/db/index.ts';
import { field, isLength } from '#lib/rules.ts';
import type { Actions } from './$types';

// Categories that every new organization starts with; the Administrator can change them in the Catalogue.
const STARTER_CATEGORIES = ['Chatbot', 'Writing', 'Code assistant', 'Image generator'];

export const actions: Actions = {
	// Create an organization: the person becomes its first Administrator, in a department that they name.
	create: async ({ request, locals }) => {
		const me = locals.user!, f = await request.formData(), orgName = field(f, 'orgName'), depName = field(f, 'depName');
		if (!isLength(orgName, 2, 80)) return fail(400, { orgName, depName, error: 'Enter an organization name of 2 to 80 characters' });
		if (!isLength(depName, 2, 50)) return fail(400, { orgName, depName, error: 'Enter a department name of 2 to 50 characters' });
		const done = await db.transaction(async (tx) => {
			const [org] = await tx.insert(organization).values({ org_name: orgName }).returning({ id: organization.org_id });
			const [dep] = await tx.insert(department).values({ org_id: org.id, dep_name: depName }).returning({ id: department.dep_id });
			await tx.insert(category).values(STARTER_CATEGORIES.map((c) => ({ org_id: org.id, cat_name: c })));
			// The org_id condition stops a second, parallel submit from creating a second organization.
			const moved = await tx.update(user).set({ org_id: org.id, dep_id: dep.id, usr_role: 'Administrator' })
				.where(and(eq(user.usr_id, me.id), isNull(user.org_id))).returning({ id: user.usr_id });
			if (!moved.length) tx.rollback();
			return true;
		}).catch(() => false);
		if (!done) return fail(409, { orgName, depName, error: 'You already belong to an organization' });
		redirect(303, '/admin');
	},
	// Join: accept a full invite link or only its code, then open the Join page.
	join: async ({ request }) => {
		const text = field(await request.formData(), 'link'), code = text.split('/join/').pop()?.split(/[?#\s]/)[0] ?? '';
		if (!/^[\w-]{10,40}$/.test(code)) return fail(400, { link: text, error: 'Paste the invite link that you received' });
		redirect(303, `/join/${code}`);
	}
};
