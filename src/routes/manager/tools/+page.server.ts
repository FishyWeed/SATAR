import { departmentTools } from '#lib/server/queries.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({ tools: await departmentTools(locals.user!.depId) });
