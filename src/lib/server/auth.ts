import { redirect } from '@sveltejs/kit';
import { HOME, type Role } from '#lib/rules.ts';

/** A signed-in member of an organization. Pages of the four roles use this, so every query can filter by orgId. */
export type Member = { id: string; firstName: string; lastName: string; email: string; role: Role; depId: number; orgId: number; orgName: string };

/** The signed-in member, or a redirect to the right start page (the hook normally stops the others earlier). */
export function member(locals: App.Locals): Member {
	const u = locals.user;
	if (!u || !u.orgId || !u.depId || !u.role || u.role === 'Owner') redirect(303, '/');
	return u as Member;
}

/** The start page of a signed-in user: the Owner's page, the Welcome page, or the home page of the role. */
export function homeOf(u: NonNullable<App.Locals['user']>) {
	if (u.role === 'Owner') return '/owner';
	return u.orgId && u.role ? HOME[u.role] : '/welcome';
}
