import { requestRows } from '#lib/server/queries.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({ requests: await requestRows({ orgId: member(locals).orgId, depId: member(locals).depId, status: 'Pending Manager' }) });
