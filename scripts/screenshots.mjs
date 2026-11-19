// Takes a full-page screenshot of each of the 25 screens of the running app (npm run dev), signed in as the right role,
// with headless Microsoft Edge driven through the Chrome DevTools Protocol (no extra packages).
// Usage: node scripts/screenshots.mjs <test accounts JSON> <output folder>
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import postgres from 'postgres';

process.loadEnvFile();
const [accountsFile, outDir] = process.argv.slice(2);
const A = JSON.parse(readFileSync(accountsFile, 'utf8'));
const LANDING_H = 1900;
const BASE = 'http://localhost:8888', EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', PORT = 9333;
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
mkdirSync(outDir, { recursive: true });

// Sign in with fetch and keep the session cookies (as in unit-tests.mjs).
async function cookiesFor(who) {
	const jar = new Map();
	let res = await fetch(BASE + '/login', { method: 'POST', redirect: 'manual', headers: { accept: 'text/html', origin: BASE, 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ email: A[who].email, password: A[who].password }) });
	for (const c of res.headers.getSetCookie()) { const [pair] = c.split(';'), i = pair.indexOf('='); jar.set(pair.slice(0, i), pair.slice(i + 1)); }
	if (res.status !== 303) throw new Error(`sign-in of ${who} failed`);
	return [...jar].map(([name, value]) => ({ name, value, domain: 'localhost', path: '/' }));
}
async function post(cookies, path, form) {
	await fetch(BASE + path, { method: 'POST', redirect: 'manual', body: new URLSearchParams(form),
		headers: { accept: 'text/html', origin: BASE, 'content-type': 'application/x-www-form-urlencoded', cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') } });
}

const S = Object.fromEntries(await Promise.all([['emp1', 'emp1'], ['mgr', 'mgr1'], ['rev', 'rvw1'], ['admin', 'adm1'], ['newbie', 'newbie'], ['owner', 'owner']].map(async ([k, w]) => [k, await cookiesFor(w)])));

// Fresh demo data: one request waiting for the Finance Manager, one waiting for the Reviewer and one with both decisions (NotesBot).
const [cat] = await sql`select c.cat_id from category_t c join organization_t o using (org_id) where o.org_name = 'Noctua Demo' and c.cat_name = 'Code assistant'`;
for (const name of ['GitHub Copilot', 'Perplexity', 'NotesBot']) {
	const [t] = await sql`select tol_id from tool_t where tol_name = ${name}`;
	if (t) { await sql`delete from audit_log_t where tol_id = ${t.tol_id}`; await sql`delete from request_t where tol_id = ${t.tol_id}`; await sql`delete from tool_t where tol_id = ${t.tol_id}`; }
}
await post(S.emp1, '/requests/new', { name: 'GitHub Copilot', vendor: 'GitHub', url: 'https://github.com/features/copilot', cat: cat.cat_id, purpose: 'Suggest code for the finance reports scripts', dataClass: 'Confidential' });
await post(S.emp1, '/requests/new', { name: 'Perplexity', vendor: 'Perplexity AI', url: 'https://www.perplexity.ai', cat: cat.cat_id, purpose: 'Research market news for the monthly report', dataClass: 'Public' });
const id = async (name) => (await sql`select r.req_id from request_t r join tool_t t using (tol_id) where t.tol_name = ${name}`)[0].req_id;
await post(S.mgr, `/manager/requests/${await id('Perplexity')}`, { decision: 'Approve', reason: 'Saves research time for the monthly report' });
await post(S.emp1, '/requests/new', { name: 'NotesBot', vendor: 'NotesBot Ltd', url: 'https://notesbot.example', cat: cat.cat_id, purpose: 'Summarize meeting notes', dataClass: 'Internal' });
await post(S.mgr, `/manager/requests/${await id('NotesBot')}`, { decision: 'Approve', reason: 'Saves time on meeting notes' });
await post(S.rev, `/reviewer/queue/${await id('NotesBot')}`, { risk: 'Low', dataClass: 'Internal', conditions: 'Sign in with your work account only.', reviewDate: '2027-11-30', decision: 'Approve', reason: 'Low risk for meeting notes' });
const [chat] = await sql`select t.tol_id from tool_t t join organization_t o using (org_id) where o.org_name = 'Noctua Demo' and t.tol_name = 'ChatGPT'`;
const month = 'from=2026-11-01&to=2026-11-30';
// An invite link of Noctua Demo for screenshot 30 (the Administrator creates it in the app).
const [fin] = await sql`select d.dep_id from department_t d join organization_t o using (org_id) where o.org_name = 'Noctua Demo' and d.dep_name = 'Finance'`;
const inviteHtml = await fetch(BASE + '/admin/users?/invite', { method: 'POST', redirect: 'manual', body: new URLSearchParams({ role: 'Employee', dep: fin.dep_id, email: '' }),
	headers: { accept: 'text/html', origin: BASE, 'content-type': 'application/x-www-form-urlencoded', cookie: S.admin.map((c) => `${c.name}=${c.value}`).join('; ') } }).then((r) => r.text());
const inviteCode = inviteHtml.match(/\/join\/([0-9a-f]+)</)?.[1];
if (!inviteCode) throw new Error('no invite code for screenshot 30');

const SHOTS = [
	[1, null, '/login'], [2, null, '/forgot-password'], [3, 'emp1', '/reset-password'], [4, 'emp1', '/employee'], [5, 'emp1', '/register'],
	[6, 'emp1', `/register/${chat.tol_id}`], [7, 'emp1', '/requests/new'], [8, 'emp1', '/requests'], [9, 'emp1', `/requests/${await id('NotesBot')}`],
	[10, 'mgr', '/manager'], [11, 'mgr', '/manager/requests'], [12, 'mgr', `/manager/requests/${await id('GitHub Copilot')}`], [13, 'mgr', '/manager/tools'],
	[14, 'rev', '/reviewer'], [15, 'rev', '/reviewer/queue'], [16, 'rev', `/reviewer/queue/${await id('Perplexity')}`], [17, 'rev', '/reviewer/overdue'],
	[18, 'admin', '/admin'], [19, 'admin', '/admin/users'], [20, 'admin', '/admin/users', 'main table button[data-edit-user]'], [21, 'admin', '/admin/departments'],
	[22, 'admin', '/admin/catalogue'], [23, 'admin', `/admin/audit?${month}`], [24, 'admin', `/admin/reports?type=register&${month}`], [25, 'emp1', '/profile'],
	// The Catalogue again, with the edit popup of the first category open (the 4th item is a button to click).
	['22b', 'admin', '/admin/catalogue', 'main table button[type=button]'],
	// Organizations and accounts. 19b: the Invite user popup. 30: the invite as the new user (newbie) sees it before joining.
	['19b', 'admin', '/admin/users', '#inviteBtn'],
	['21b', 'admin', '/admin/departments', 'main table button[type=button]'],
	[26, null, '/'], [27, null, '/signup'], [28, null, '/signup/check-email?email=gopal%40example.com'], [29, 'newbie', '/welcome'],
	[30, 'newbie', `/join/${inviteCode}`], [31, 'owner', '/owner']
];
await sql.end();

// ---------- headless Edge through the DevTools Protocol ----------
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'satar-shots-'))}`, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 40 && !target; i++) {
	await new Promise((r) => setTimeout(r, 250));
	target = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === 'page')).catch(() => null);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const waiting = new Map(), events = [];
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id) waiting.get(m.id)?.(m); else events.push(m.method); });
const send = (method, params = {}) => new Promise((resolve, reject) => {
	const n = ++seq; waiting.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result))); ws.send(JSON.stringify({ id: n, method, params }));
});
const loaded = async () => { for (let i = 0; i < 80 && !events.includes('Page.loadEventFired'); i++) await new Promise((r) => setTimeout(r, 100)); events.length = 0; };

await send('Page.enable'); await send('Network.enable');
// Reduced motion shows every scroll reveal at once, so nothing is blurred in a full-page screenshot.
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
for (const [n, who, path, click] of SHOTS) {
	await send('Network.clearBrowserCookies');
	if (who) await send('Network.setCookies', { cookies: S[who] });
	await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 700, deviceScaleFactor: 1, mobile: false });
	events.length = 0; await send('Page.navigate', { url: BASE + path }); await loaded();
	await new Promise((r) => setTimeout(r, 300));
	// Measure the page in a short window, so that a short page gets a short screenshot.
	await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 200, deviceScaleFactor: 1, mobile: false });
	const { result } = await send('Runtime.evaluate', { expression: 'Math.ceil(document.querySelector("main").getBoundingClientRect().bottom)' });
	// A popup is drawn over the window, so its screenshot needs a window tall enough for the popup.
	// The landing page is very tall: keep its top part (forest, register preview and problem), so that it stays readable on a report page.
	const height = path === '/' ? LANDING_H : Math.max(click ? 820 : 300, result.value + 8);
	await send('Emulation.setDeviceMetricsOverride', { width: 1000, height, deviceScaleFactor: 1, mobile: false });
	if (click) {
		await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(click)}).click()` });
		await new Promise((r) => setTimeout(r, 300));
	}
	const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1000, height, scale: 1 } });
	writeFileSync(join(outDir, `shot${n}.png`), Buffer.from(data, 'base64'));
	console.log(`shot${n}.png ${path.split('?')[0]} (${height}px)`);
}
ws.close(); edge.kill();
