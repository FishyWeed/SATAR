import { auditRows, readRange } from '#lib/server/reports.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const range = readRange(url);
	return { ...range, rows: range.error ? [] : await auditRows(range.from, range.to) };
};
