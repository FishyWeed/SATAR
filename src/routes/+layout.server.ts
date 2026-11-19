import { homeOf } from '#lib/server/auth.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({ user: locals.user, home: locals.user ? homeOf(locals.user) : null });
