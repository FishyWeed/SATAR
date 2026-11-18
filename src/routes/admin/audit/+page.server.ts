import { auditRows, readRange } from '#lib/server/reports.ts';
import { member } from '#lib/server/auth.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const range = readRange(url);
	return { ...range, rows: range.error ? [] : await auditRows(member(locals).orgId, range.from, range.to) };
};
