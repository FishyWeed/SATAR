// Adds test data for the unit test plans (no email is sent; all accounts are on the satar.test domain):
// - "Noctua Demo": 4 departments, 4 categories, an approved tool (ChatGPT) and one account for each role;
// - "Other Org Sdn Bhd": a second organization with its own Administrator and tool, to prove that organizations are apart;
// - newbie@ and newbie2@satar.test: accounts that have not created or joined an organization yet;
// - owner@satar.test: a test platform Owner.
// The passwords are random and go to the file given as the first argument (keep it out of git).
// Usage: npm run seed-test -- ../satar-test-accounts.json
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

process.loadEnvFile();
const out = process.argv[2];
if (!out) {
	console.error('Usage: npm run seed-test -- <file for the test passwords>');
	process.exit(1);
}
const auth = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).auth.admin;
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function org(name) {
	const [o] = await sql`select org_id from organization_t where org_name = ${name}`;
	return o?.org_id ?? (await sql`insert into organization_t (org_name) values (${name}) returning org_id`)[0].org_id;
}
const people = [
	// email, first, last, role, department, organization
	['admin@satar.test', 'Test', 'Admin', 'Administrator', 'IT', 'Noctua Demo'],
	['emp1@satar.test', 'Aina', 'Employee', 'Employee', 'Finance', 'Noctua Demo'],
	['emp2@satar.test', 'Ben', 'Employee', 'Employee', 'Marketing', 'Noctua Demo'],
	['mgr@satar.test', 'Chong', 'Manager', 'Manager', 'Finance', 'Noctua Demo'],
	['rev@satar.test', 'Devi', 'Reviewer', 'Reviewer', 'IT', 'Noctua Demo'],
	['mgr2@satar.test', 'Elan', 'Manager', 'Manager', 'HR', 'Noctua Demo'],
	['other@satar.test', 'Farah', 'Admin', 'Administrator', 'Operations', 'Other Org Sdn Bhd'],
	['newbie@satar.test', 'Gopal', 'Newcomer', null, null, null],
	['newbie2@satar.test', 'Hana', 'Newcomer', null, null, null],
	['owner@satar.test', 'Platform', 'Owner', 'Owner', null, null]
];
const accounts = {};
try {
	const demo = await org('Noctua Demo'), other = await org('Other Org Sdn Bhd');
	await sql`update organization_t set org_active = true where org_id in (${demo}, ${other})`;
	for (const d of ['IT', 'Finance', 'Marketing', 'HR']) await sql`insert into department_t (org_id, dep_name) values (${demo}, ${d}) on conflict do nothing`;
	await sql`insert into department_t (org_id, dep_name) values (${other}, 'Operations') on conflict do nothing`;
	for (const c of ['Chatbot', 'Writing', 'Code assistant']) await sql`insert into category_t (org_id, cat_name) values (${demo}, ${c}) on conflict do nothing`;
	await sql`insert into category_t (org_id, cat_name) values (${other}, 'Chatbot') on conflict do nothing`;
	const tool = async (o, name, vendor, url) => {
		const [c] = await sql`select cat_id from category_t where org_id = ${o} and cat_name = 'Chatbot'`;
		await sql`insert into tool_t (org_id, tol_name, tol_vendor, tol_url, cat_id, tol_status, tol_risk, tol_data_class, tol_conditions, tol_review_date)
			values (${o}, ${name}, ${vendor}, ${url}, ${c.cat_id}, 'Approved', 'Medium', 'Internal', 'No customer data. Turn off chat history.', '2027-06-30')
			on conflict do nothing`;
	};
	await tool(demo, 'ChatGPT', 'OpenAI', 'https://chatgpt.com');
	await tool(other, 'SecretTool', 'Other vendor', 'https://secret.example');

	const { data: list } = await auth.listUsers({ perPage: 1000 });
	for (const [email, first, last, role, dep, orgName] of people) {
		const password = randomBytes(12).toString('base64url') + '#9a';
		const old = list.users.find((u) => u.email === email);
		const { data, error } = old ? await auth.updateUserById(old.id, { password }) : await auth.createUser({ email, password, email_confirm: true });
		if (error) throw new Error(`${email}: ${error.message}`);
		const o = orgName ? await org(orgName) : null;
		const [d] = dep ? await sql`select dep_id from department_t where org_id = ${o} and dep_name = ${dep}` : [{ dep_id: null }];
		await sql`insert into user_t (usr_id, org_id, usr_f_name, usr_l_name, usr_email, usr_role, dep_id) values (${data.user.id}, ${o}, ${first}, ${last}, ${email}, ${role}, ${d.dep_id})
			on conflict (usr_id) do update set org_id = excluded.org_id, usr_role = excluded.usr_role, dep_id = excluded.dep_id, usr_active = true`;
		accounts[email.split('@')[0]] = { email, password };
	}
	writeFileSync(out, JSON.stringify(accounts, null, 2));
	console.log(`Test data added. Test passwords written to ${out}`);
} finally {
	await sql.end();
}
