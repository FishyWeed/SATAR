// Runs the 25 unit test plans of the final report (section 7.0.9.2) against the running app (npm run dev),
// and writes the actual message and the result (Pass or Fail) of each test case to a JSON file.
// Usage: node scripts/unit-tests.mjs <test accounts JSON from seed-test> <results JSON>
// It changes data: run `npm run seed-test` first and afterwards (to reset the test passwords).
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

process.loadEnvFile();
const [accountsFile, outFile] = process.argv.slice(2);
const A = JSON.parse(readFileSync(accountsFile, 'utf8'));
// The app to test: the dev server by default, or another address in SATAR_URL (for example the Netlify site).
const BASE = process.env.SATAR_URL ?? 'http://localhost:8888';
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

// ---------- a tiny browser: cookies, form posts, redirects ----------
class Session {
	jar = new Map();
	cookie() { return [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '); }
	keep(res) {
		for (const c of res.headers.getSetCookie()) {
			const [pair] = c.split(';'), i = pair.indexOf('='), name = pair.slice(0, i), value = pair.slice(i + 1);
			if (/max-age=0/i.test(c) || value === '') this.jar.delete(name); else this.jar.set(name, value);
		}
	}
	async go(path, form) {
		let res = await fetch(BASE + path, {
			method: form ? 'POST' : 'GET', redirect: 'manual',
			headers: { accept: 'text/html', origin: BASE, cookie: this.cookie(), ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
			body: form ? new URLSearchParams(form) : undefined
		});
		this.keep(res);
		const hops = [];
		while (res.status >= 300 && res.status < 400) {
			const to = new URL(res.headers.get('location'), BASE);
			hops.push(to.pathname);
			res = await fetch(to, { redirect: 'manual', headers: { accept: 'text/html', cookie: this.cookie() } });
			this.keep(res);
		}
		const html = await res.text();
		return { status: res.status, html, path: hops.at(-1) ?? path, h1: text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]), msg: text(html.match(/role="(?:alert|status)"[^>]*>([\s\S]*?)<\/p>/)?.[1]) };
	}
	async login(who) { await this.go('/login', { email: A[who].email, password: A[who].password }); return this; }
}
const text = (s) => (s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const appears = (r) => `The ${r.h1} page appears`;
const rows = (html) => (html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr/g) ?? []).length;
const cellTexts = (html) => [...(html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '').matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => text(m[1]));

const results = {};
const record = (n, list) => { results[n] = list; };

// ---------- clean the data that earlier runs of this script made ----------
// (GitHub Copilot and Perplexity come from screenshots.mjs.)
const made = ['NotesBot', 'MeetingAI', 'PromptPal', 'BrandWriter', 'Otter.ai', 'Grammarly', 'GitHub Copilot', 'Perplexity'];
await sql`delete from audit_log_t where tol_id in (select tol_id from tool_t where tol_name in ${sql(made)})`;
await sql`delete from request_t where tol_id in (select tol_id from tool_t where tol_name in ${sql(made)})`;
await sql`delete from tool_t where tol_name in ${sql(made)}`;
const [{ org_id: demo }] = await sql`select org_id from organization_t where org_name = 'Noctua Demo'`;
const [{ org_id: other }] = await sql`select org_id from organization_t where org_name = 'Other Org Sdn Bhd'`;
await sql`delete from department_t where org_id = ${demo} and dep_name = 'Legal'`;
await sql`delete from category_t where org_id = ${demo} and cat_name = 'Image generator'`;
// Tests 27 to 29 make an organization and invites, and move the two newcomers into organizations: undo that.
await sql`update user_t set org_id = null, dep_id = null, usr_role = null where usr_email in ('newbie@satar.test', 'newbie2@satar.test')`;
await sql`delete from invite_t where org_id in (${demo}, ${other}) or org_id in (select org_id from organization_t where org_name = 'Newbie Org')`;
for (const t of ['category_t', 'department_t']) await sql`delete from ${sql(t)} where org_id in (select org_id from organization_t where org_name = 'Newbie Org')`;
await sql`delete from organization_t where org_name = 'Newbie Org'`;
await sql`update organization_t set org_active = true where org_id = ${other}`;
// The user that test 20 adds: remove both the USER_T row and the Supabase Auth account.
const authAdmin = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).auth.admin;
for (const [u] of [await sql`delete from user_t where usr_email = 'aina@satar.test' returning usr_id`]) if (u) await authAdmin.deleteUser(u.usr_id);
const { data: authList } = await authAdmin.listUsers({ perPage: 1000 });
for (const u of authList.users.filter((x) => x.email === 'aina@satar.test')) await authAdmin.deleteUser(u.id);
const [cat] = await sql`select cat_id from category_t where org_id = ${demo} and cat_name = 'Chatbot'`;
const [chat] = await sql`select tol_id from tool_t where org_id = ${demo} and tol_name = 'ChatGPT'`;

const emp1 = await new Session().login('emp1'), emp2 = await new Session().login('emp2'), mgr = await new Session().login('mgr');
const mgr2 = await new Session().login('mgr2'), rev = await new Session().login('rev'), admin = await new Session().login('admin');
const req = (s, name, purpose) => s.go('/requests/new', { name, vendor: 'Test vendor', url: `https://${name.toLowerCase()}.example`, cat: cat.cat_id, purpose, dataClass: 'Internal' });
const reqId = async (name) => (await sql`select r.req_id from request_t r join tool_t t using (tol_id) where t.tol_name = ${name}`)[0].req_id;

// 1 Sign In
{
	const s = new Session(), out = [];
	for (const [email, password] of [['', ''], ['emp1@satar', ''], ['emp1@satar.test', '123'], ['emp1@satar.test', 'Wrong#Pass1']]) out.push((await s.go('/login', { email, password })).msg);
	const r = await new Session().go('/login', { email: A.emp1.email, password: A.emp1.password });
	out.push(appears(r));
	record(1, out);
}
// 2 Forgot Password
record(2, [(await new Session().go('/forgot-password', { email: '' })).msg, (await new Session().go('/forgot-password', { email: 'emp1@satar' })).msg, (await new Session().go('/forgot-password', { email: A.emp1.email })).msg]);
// 4 Employee Home
record(4, [
	(await emp1.go('/employee')).h1 === 'Employee Home' ? 'Cards and recent requests of the employee appear' : 'Wrong page',
	appears(await mgr.go('/employee')),
	appears(await new Session().go('/employee'))
]);
// 5 AI Tool Register
{
	const all = await emp1.go('/register?q='), chatQ = await emp1.go('/register?q=chat');
	const total = (await sql`select count(*)::int n from tool_t where org_id = ${demo}`)[0].n;
	record(5, [
		rows(all.html) === total ? 'All tools appear' : `${rows(all.html)} of ${total} tools appear`,
		cellTexts(chatQ.html).every((t) => /chat/i.test(t)) && rows(chatQ.html) > 0 ? 'Only tools with "chat" in the name appear' : 'Other tools appear',
		(await emp1.go('/register?q=' + 'x'.repeat(51))).msg,
		(await emp1.go('/register?q=zzzz')).msg
	]);
}
// 6 Tool Details
{
	const ok = await emp1.go(`/register/${chat.tol_id}`);
	record(6, [ok.h1 === 'Tool Details' && ok.html.includes('ChatGPT') ? `The details of tool ${chat.tol_id} appear` : 'Wrong page', (await emp1.go('/register/9999')).h1, (await emp1.go('/register/abc')).h1]);
}
// 7 Submit Tool Request (TC4 makes NotesBot); then MeetingAI so that emp1 has 2 requests for test 8
{
	const out = [
		(await emp1.go('/requests/new', { name: '', vendor: '', url: '', cat: '', purpose: '', dataClass: '' })).msg,
		(await emp1.go('/requests/new', { name: 'NotesBot', vendor: 'Test vendor', url: 'notesbot', cat: cat.cat_id, purpose: 'Summarize notes', dataClass: 'Internal' })).msg,
		(await emp1.go('/requests/new', { name: 'ChatGPT', vendor: 'OpenAI', url: 'https://chatgpt.com', cat: cat.cat_id, purpose: 'Draft emails', dataClass: 'Internal' })).msg,
		(await req(emp1, 'NotesBot', 'Summarize meeting notes')).msg
	];
	record(7, out);
	await req(emp1, 'MeetingAI', 'Write meeting minutes');
}
// 8 My Requests
{
	const r = await emp1.go('/requests'), n = rows(r.html);
	record(8, [n === 2 ? 'The 2 requests appear with status and notes' : `${n} requests appear`, (await emp2.go('/requests')).msg]);
}
// 9 Request Details
{
	const id = await reqId('NotesBot'), own = await emp1.go(`/requests/${id}`);
	record(9, [own.h1 === 'Request Details' && own.html.includes('s-steps') ? 'The details and the steps of the request appear' : 'Wrong page', (await emp2.go(`/requests/${id}`)).h1]);
}
// more data for the manager and reviewer tests: one Marketing request, and PromptPal (Finance) for the Ban test
await req(emp2, 'BrandWriter', 'Write campaign text');
await req(emp1, 'PromptPal', 'Prompt library');
// 10 Manager Home
{
	const r = await mgr.go('/manager');
	record(10, [r.h1 === 'Manager Home' && !r.html.includes('BrandWriter') && r.html.includes('NotesBot') ? 'Cards and pending requests of Finance appear' : 'Wrong data', appears(await emp1.go('/manager'))]);
}
// 11 Department Requests, TC1 (TC2 runs after the decisions)
const deptList = await mgr.go('/manager/requests');
const tc11a = !deptList.html.includes('BrandWriter') && deptList.html.includes('NotesBot') ? 'Only the requests of Finance staff appear' : 'Requests of other departments appear';
// 12 Review Request
{
	const notes = `/manager/requests/${await reqId('NotesBot')}`, meeting = `/manager/requests/${await reqId('MeetingAI')}`;
	const status = async (n) => (await sql`select req_status from request_t where req_id = ${await reqId(n)}`)[0].req_status;
	const out = [(await mgr.go(notes, { decision: 'Approve', reason: '' })).msg, (await mgr.go(notes, { decision: 'Reject', reason: '' })).msg];
	let r = await mgr.go(notes, { decision: 'Approve', reason: 'Needed for reports' });
	out.push(`${r.msg}; status is '${await status('NotesBot')}'`);
	r = await mgr.go(meeting, { decision: 'Reject', reason: 'Not needed' });
	out.push(`${r.msg}; status is '${await status('MeetingAI')}'`);
	record(12, out);
	await mgr.go(`/manager/requests/${await reqId('PromptPal')}`, { decision: 'Approve', reason: 'Useful for the team' });
}
record(11, [tc11a, (await mgr.go('/manager/requests')).msg]);
// 13 Department Tools
{
	const r = await mgr.go('/manager/tools');
	record(13, [r.html.includes('NotesBot') && !r.html.includes('BrandWriter') ? 'The tools used by Finance staff appear' : 'Wrong tools', (await mgr2.go('/manager/tools')).msg]);
}
// 14 Reviewer Home, 15 Risk Review Queue
{
	const r = await rev.go('/reviewer');
	record(14, [r.h1 === 'Reviewer Home' && r.html.includes('NotesBot') ? 'Cards and requests approved by managers appear' : 'Wrong page', appears(await mgr.go('/reviewer'))]);
	const q = await rev.go('/reviewer/queue'), pending = (await sql`select count(*)::int n from request_t where org_id = ${demo} and req_status = 'Pending Reviewer'`)[0].n;
	record(15, [rows(q.html) === pending && !q.html.includes('BrandWriter') && !q.html.includes('MeetingAI') ? "Only requests with status 'Pending Reviewer' appear" : 'Wrong requests', appears(await admin.go('/reviewer/queue'))]);
}
// 16 Risk Check
{
	const notes = `/reviewer/queue/${await reqId('NotesBot')}`, pal = `/reviewer/queue/${await reqId('PromptPal')}`;
	const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
	const tstatus = async (n) => (await sql`select tol_status from tool_t where tol_name = ${n}`)[0].tol_status;
	const form = (risk, dataClass, reviewDate, decision) => ({ risk, dataClass, conditions: risk ? 'No customer data' : '', reviewDate, decision, reason: risk ? 'Checked the terms of use' : '' });
	const out = [(await rev.go(notes, form('', '', '', ''))).msg, (await rev.go(notes, form('Medium', 'Internal', yesterday, 'Approve'))).msg];
	let r = await rev.go(notes, form('Medium', 'Internal', '2027-06-30', 'Approve'));
	out.push(`${r.msg}; tool status is '${await tstatus('NotesBot')}'`);
	r = await rev.go(pal, form('High', 'Public', '2027-06-30', 'Ban'));
	out.push(`${r.msg}; tool status is '${await tstatus('PromptPal')}'`);
	record(16, out);
}
// 17 Overdue Reviews: TC2 first (no overdue tool), then two tools with past review dates
{
	const none = (await rev.go('/reviewer/overdue')).msg;
	await sql`insert into tool_t (org_id, tol_name, tol_vendor, tol_url, cat_id, tol_status, tol_risk, tol_data_class, tol_conditions, tol_review_date) values
		(${demo}, 'Otter.ai', 'Otter', 'https://otter.ai', ${cat.cat_id}, 'Approved', 'Medium', 'Internal', 'Internal meetings only', '2026-11-01'),
		(${demo}, 'Grammarly', 'Grammarly', 'https://grammarly.com', ${cat.cat_id}, 'Approved', 'Low', 'Public', 'Public text only', '2026-10-15')`;
	const r = await rev.go('/reviewer/overdue'), list = cellTexts(r.html);
	record(17, [list.length === 2 && list[0].startsWith('Grammarly') ? 'The 2 tools appear, oldest first' : `${list.length} tools appear`, none]);
}
// 18 Dashboard, 19 Manage Users
{
	const d = await admin.go('/admin');
	record(18, [d.h1 === 'Administrator Dashboard' && d.html.includes('Tools by risk level') ? 'Counts by status and the risk chart appear' : 'Wrong page', appears(await rev.go('/admin'))]);
	const u = await admin.go('/admin/users'), users = (await sql`select count(*)::int n from user_t where org_id = ${demo}`)[0].n;
	record(19, [rows(u.html) === users ? 'All users appear with role and department' : `${rows(u.html)} of ${users} users appear`, appears(await emp1.go('/admin/users'))]);
}
// 20 Edit User (new users join with invite links, test 28)
{
	const id = async (email) => (await sql`select usr_id, dep_id from user_t where usr_email = ${email}`)[0];
	const ben = await id(A.emp2.email), me = await id(A.admin.email);
	record(20, [
		(await admin.go(`/admin/users/${ben.usr_id}`, { first: '', last: '', role: '', dep: '' })).msg,
		(await admin.go(`/admin/users/${me.usr_id}`, { first: 'Test', last: 'Admin', role: 'Administrator', dep: me.dep_id })).msg,
		(await admin.go(`/admin/users/${ben.usr_id}`, { first: 'Ben', last: 'Employee', role: 'Employee', dep: ben.dep_id, active: 'on' })).msg
	]);
}
// 21 Departments, 22 Categories
record(21, [(await admin.go('/admin/departments?/add', { name: 'A' })).msg, (await admin.go('/admin/departments?/add', { name: 'Finance' })).msg, (await admin.go('/admin/departments?/add', { name: 'Legal' })).msg]);
record(22, [(await admin.go('/admin/catalogue?/add', { name: 'A' })).msg, (await admin.go('/admin/catalogue?/add', { name: 'Chatbot' })).msg, (await admin.go('/admin/catalogue?/add', { name: 'Image generator' })).msg]);
// 23 Audit Log, 24 Reports (the plan uses November 2026, the month of the test run)
{
	const a = await admin.go('/admin/audit?from=2026-11-10&to=2026-11-01'), b = await admin.go('/admin/audit?from=2026-11-01&to=2026-11-30');
	record(23, [a.msg, rows(b.html) > 0 && !b.msg ? 'The decisions of November 2026 appear' : b.msg || 'No rows']);
	const r = await admin.go('/admin/reports?type=register&from=2026-11-01&to=2026-11-30');
	record(24, [(await admin.go('/admin/reports?type=&from=&to=')).msg, (await admin.go('/admin/reports?type=register&from=2026-11-10&to=2026-11-01')).msg,
		/<h2>AI Tool Register Report<\/h2>/.test(r.html) ? 'The AI Tool Register Report appears' : 'No report']);
}
// 26 Landing page and 28 Check your email (record numbers = screen numbers of the report)
record(26, [(await new Session().go('/')).h1.startsWith('Keep watch over') ? 'The landing page appears with Get started and Sign in' : 'Wrong page',
	(await emp1.go('/')).html.includes('Open SATAR') ? 'The landing page appears with Open SATAR' : 'Wrong page']);
record(28, [(await new Session().go('/signup/check-email?email=gopal%40example.com')).html.includes('gopal@example.com') ? 'The Check your email page appears with the email address' : 'Wrong page']);
// 27 Sign Up: only the checks before Supabase sends an email (no email is sent in the tests)
{
	const s = new Session();
	const up = (first, email, password, confirm) => s.go('/signup', { first, last: first ? 'Test' : '', email, password, confirm });
	record(27, [(await up('', '', '', '')).msg, (await up('Gopal', A.newbie.email, 'NewPass#2027', 'NewPass#2027')).msg, (await up('Ivan', 'ivan@satar.test', 'NewPass#2027', 'NewPass#2028')).msg]);
}
// 29 Welcome and Create organization (newbie creates "Newbie Org")
{
	const nb = await new Session().login('newbie');
	const w = await nb.go('/welcome');
	const bad = await nb.go('/welcome?/create', { orgName: 'A', depName: 'IT' });
	const ok = await nb.go('/welcome?/create', { orgName: 'Newbie Org', depName: 'IT' });
	const cats = (await sql`select count(*)::int n from category_t c join organization_t o using (org_id) where o.org_name = 'Newbie Org'`)[0].n;
	record(29, [w.h1 === 'Welcome, Gopal' ? 'The Welcome page appears with both choices' : appears(w), appears(await emp1.go('/welcome')), bad.msg,
		ok.path === '/admin' && cats === 4 ? 'The organization is created with 4 starter categories; the Administrator Dashboard page appears' : `${appears(ok)} (${cats} categories)`]);
}
// 19 (more) Invite user (the Administrator of Noctua Demo)
const [fin] = await sql`select dep_id from department_t where org_id = ${demo} and dep_name = 'Finance'`;
const inviteLink = async (role, email = '') => (await admin.go('/admin/users?/invite', { role, dep: fin.dep_id, email })).html.match(/<code>[^<]*\/join\/([0-9a-f]+)<\/code>/)?.[1];
{
	const blank = await admin.go('/admin/users?/invite', { role: '', dep: '', email: '' });
	const code = await inviteLink('Employee');
	const open = await admin.go('/admin/users');
	record(19, [...results[19], blank.msg, code ? 'Invite created; the link appears with a Copy button' : 'No link', open.html.includes(code ?? 'none') ? 'The invite appears in Open invites' : 'Not listed']);
}
// 30 Join with an invite link
{
	const code = await inviteLink('Employee'), locked = await inviteLink('Reviewer', 'someone@satar.test');
	const visitor = await new Session().go(`/join/${code}`);
	const nb2 = await new Session().login('newbie2');
	const wrong = await nb2.go(`/join/${locked}`);
	const asMember = await emp1.go(`/join/${code}`);
	const joined = await nb2.go(`/join/${code}`, {});
	const again = await new Session().go(`/join/${code}`);
	const late = await inviteLink('Employee');
	await sql`update invite_t set inv_expires = now() - interval '1 day' where inv_code = ${late}`;
	const expired = await new Session().go(`/join/${late}`);
	const msg = (r) => text(r.html.match(/role="alert"[^>]*>([\s\S]*?)<\/p>/)?.[1]);
	record(30, [visitor.html.includes('Create an account to join') ? 'The invite appears with Sign in and Create account buttons' : 'Wrong page',
		msg(wrong), msg(asMember), joined.path === '/employee' ? 'The user joins Noctua Demo; the Employee Home page appears' : appears(joined), msg(again), msg(expired)]);
}
// 31 Owner: the Organizations page, and deactivating an organization
{
	const ow = await new Session().login('owner');
	const page = await ow.go('/owner');
	const off = await ow.go('/owner?/toggle', { id: other });
	const blocked = await new Session().go('/login', { email: A.other.email, password: A.other.password });
	await ow.go('/owner?/toggle', { id: other });
	record(31, [page.html.includes('Noctua Demo') && page.html.includes('Other Org Sdn Bhd') ? 'All organizations appear with their users' : 'Wrong list',
		appears(await ow.go('/employee')), appears(await admin.go('/owner')), off.msg, blocked.msg]);
}
// Isolation: organizations are apart: the Administrator of Other Org Sdn Bhd sees none of Noctua Demo's data
{
	const ot = await new Session().login('other');
	const reg = await ot.go('/register'), names = cellTexts(reg.html);
	record('iso', [names.length === 1 && names[0].startsWith('SecretTool') ? 'Only SecretTool appears' : `${names.length} tools appear`,
		(await ot.go(`/register/${chat.tol_id}`)).h1, (await emp1.go('/register?q=Secret')).msg,
		(await ot.go('/admin/users')).html.includes('emp1@satar.test') ? 'Users of Noctua Demo appear' : 'Only the users of Other Org Sdn Bhd appear',
		rows((await ot.go('/admin/audit?from=2026-11-01&to=2026-11-30')).html) === 0 ? 'No decisions of Noctua Demo appear' : 'Decisions of Noctua Demo appear']);
}
// 25 My Profile (Change password link, Sign out), then 3 Reset Password with emp2 (it changes emp2's password)
{
	const s = await new Session().login('emp1');
	const change = await s.go('/reset-password');
	const out = await s.go('/profile?/signout', {});
	const after = await s.go('/employee');
	record(25, [appears(change), after.path === '/login' && out.path === '/' ? 'The user is signed out and the landing page appears' : 'Still signed in']);
	const r = [(await emp2.go('/reset-password', { password: 'abc', confirm: 'abc' })).msg, (await emp2.go('/reset-password', { password: 'NewPass#2027', confirm: 'NewPass#2028' })).msg];
	const ok = await emp2.go('/reset-password', { password: 'NewPass#2027', confirm: 'NewPass#2027' });
	r.push(ok.path === '/login' && /Password saved/.test(ok.html) ? 'Password saved. Please sign in' : ok.msg || 'No message');
	record(3, r);
}
await sql.end();

writeFileSync(outFile, JSON.stringify({ ranOn: new Date().toISOString(), results }, null, 1));
const total = Object.values(results).flat().length;
console.log(`Ran ${total} test cases in ${Object.keys(results).length} programs. Results: ${outFile}`);
