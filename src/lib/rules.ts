// Shared lists, input rules and messages. The messages are the expected messages of the unit test plans (section 7.0.9.2).

export const ROLES = ['Employee', 'Manager', 'Reviewer', 'Administrator'] as const;
export const DATA_CLASSES = ['Public', 'Internal', 'Confidential', 'Restricted'] as const;
export const RISKS = ['Low', 'Medium', 'High'] as const;
export const DECISIONS = ['Approve', 'Reject', 'Ban'] as const;
export type Role = (typeof ROLES)[number];
/** A member's role inside an organization, or the platform Owner (outside every organization). */
export type UserRole = Role | 'Owner';
export type DataClass = (typeof DATA_CLASSES)[number];
export type Risk = (typeof RISKS)[number];
export type ToolStatus = 'Pending' | 'Approved' | 'Rejected' | 'Banned';
export type RequestStatus = 'Pending Manager' | 'Pending Reviewer' | 'Approved' | 'Rejected';

/** An Employee can request a tool only while it is not decided for good: approved tools are already allowed, banned tools never are. */
export const isRequestable = (status: string) => status !== 'Approved' && status !== 'Banned';

export const HOME:Record<Role, string> = { Employee: '/employee', Manager: '/manager', Reviewer: '/reviewer', Administrator: '/admin' };

export const MSG = {
	email: 'Enter a valid email id',
	password: 'Enter a valid password',
	login: 'Invalid email id or password',
	resetSent: 'If the email id is registered, a reset link is sent',
	passwordLength: 'The password must have 8 to 64 characters',
	passwordMatch: 'The passwords do not match',
	passwordSaved: 'Password saved. Please sign in',
	keyword: 'Enter a shorter keyword',
	noTool: 'No tool found',
	fields: 'Fill in all fields correctly',
	toolExists: 'Tool is already in the register',
	toolBanned: 'This tool is banned',
	toolApproved: 'This tool is already approved for use',
	openRequest: 'You already have an open request for this tool',
	submitted: 'Request submitted',
	reason: 'Enter a reason',
	futureDate: 'Enter a future review date',
	saved: 'Decision saved',
	emailUsed: 'Email id is already used',
	userSaved: 'User saved',
	nameLength: 'Enter 2 to 50 characters',
	nameExists: 'Name already exists',
	recordSaved: 'Record saved',
	dateRange: 'Enter a valid date range',
	reportType: 'Select a report type'
} as const;

/** Text value of a form field, trimmed ('' when missing). */
export const field = (f: FormData, name: string) => String(f.get(name) ?? '').trim();

// Email id: 5 to 60 characters, with @ and a domain name (flowchart of process 1.0).
export const isEmail = (s: string) => s.length >= 5 && s.length <= 60 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const isPassword = (s: string) => s.length >= 8 && s.length <= 64;
export const isLength = (s: string, min: number, max: number) => s.length >= min && s.length <= max;
export const isUrl = (s: string) => {
	if (s.length > 200) return false;
	try {
		return ['http:', 'https:'].includes(new URL(s).protocol);
	} catch {
		return false;
	}
};
export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const oneOf = <T extends string>(list: readonly T[], s: string): s is T => (list as readonly string[]).includes(s);

/** Today in Malaysia as YYYY-MM-DD (the server runs in UTC). */
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date());

/** First and last moment of a Malaysian calendar day, for date-range filters. */
export const dayStart = (d: string) => new Date(`${d}T00:00:00+08:00`);
export const dayEnd = (d: string) => new Date(`${d}T23:59:59.999+08:00`);
/** Text for a SQL LIKE pattern, with its wildcard characters escaped. */
export const likeText = (s: string) => `%${s.replace(/[\\%_]/g, '\\$&')}%`;

/** dd/mm/yyyy for a date string or a Date. */
export function fmtDate(d: string | Date | null | undefined) {
	if (!d) return '-';
	const s = typeof d === 'string' ? d.slice(0, 10) : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(d);
	const [y, m, day] = s.split('-');
	return `${day}/${m}/${y}`;
}
export const fmtTime = (d: Date) =>
	`${fmtDate(d)} ${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit' }).format(d)}`;
