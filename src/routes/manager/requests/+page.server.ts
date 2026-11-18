import { requestRows } from '#lib/server/queries.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({ requests: await requestRows({ depId: locals.user!.depId, status: 'Pending Manager' }) });
