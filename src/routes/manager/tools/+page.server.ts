import { departmentTools } from '#lib/server/queries.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({ tools: await departmentTools(member(locals).orgId, member(locals).depId) });
