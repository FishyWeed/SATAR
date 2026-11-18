import { REPORTS, buildReport, readRange, type ReportType } from '#lib/server/reports.ts';
import { MSG, fmtTime } from '#lib/rules.ts';
import type { PageServerLoad } from './$types';

// Process 8.0: read the report type and the date range, collect the records, format the report.
export const load: PageServerLoad = async ({ url }) => {
	const types = Object.entries(REPORTS).map(([value, label]) => ({ value, label }));
	const range = readRange(url), type = url.searchParams.get('type');
	if (type === null) return { types, ...range, type: '', error: '', report: null };
	if (!(type in REPORTS)) return { types, ...range, type, error: MSG.reportType, report: null };
	if (range.error) return { types, ...range, type, report: null };
	const report = await buildReport(type as ReportType, range.from, range.to);
	return { types, ...range, type, report: { title: REPORTS[type as ReportType], printedOn: fmtTime(new Date()), ...report } };
};
