// Adds test data for the unit test plans: 3 departments, 3 categories, one approved tool (ChatGPT)
// and one test account for each role on the satar.test domain (no email is sent).
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

const people = [
	['admin@satar.test', 'Test', 'Admin', 'Administrator', 'IT'],
	['emp1@satar.test', 'Aina', 'Employee', 'Employee', 'Finance'],
	['emp2@satar.test', 'Ben', 'Employee', 'Employee', 'Marketing'],
	['mgr@satar.test', 'Chong', 'Manager', 'Manager', 'Finance'],
	['rev@satar.test', 'Devi', 'Reviewer', 'Reviewer', 'IT'],
	['mgr2@satar.test', 'Elan', 'Manager', 'Manager', 'HR']
];
const accounts = {};
try {
	for (const d of ['IT', 'Finance', 'Marketing', 'HR']) await sql`insert into department_t (dep_name) values (${d}) on conflict do nothing`;
	for (const c of ['Chatbot', 'Writing', 'Code assistant']) await sql`insert into category_t (cat_name) values (${c}) on conflict do nothing`;
	const [chat] = await sql`select cat_id from category_t where cat_name = 'Chatbot'`;
	await sql`insert into tool_t (tol_name, tol_vendor, tol_url, cat_id, tol_status, tol_risk, tol_data_class, tol_conditions, tol_review_date)
		values ('ChatGPT', 'OpenAI', 'https://chatgpt.com', ${chat.cat_id}, 'Approved', 'Medium', 'Internal', 'No customer data. Turn off chat history.', '2027-06-30')
		on conflict do nothing`;

	const { data: list } = await auth.listUsers({ perPage: 1000 });
	for (const [email, first, last, role, dep] of people) {
		const password = randomBytes(12).toString('base64url') + '#9a';
		const old = list.users.find((u) => u.email === email);
		const { data, error } = old ? await auth.updateUserById(old.id, { password }) : await auth.createUser({ email, password, email_confirm: true });
		if (error) throw new Error(`${email}: ${error.message}`);
		const [d] = await sql`select dep_id from department_t where dep_name = ${dep}`;
		await sql`insert into user_t (usr_id, usr_f_name, usr_l_name, usr_email, usr_role, dep_id) values (${data.user.id}, ${first}, ${last}, ${email}, ${role}, ${d.dep_id})
			on conflict (usr_id) do update set usr_role = excluded.usr_role, dep_id = excluded.dep_id, usr_active = true`;
		accounts[email.split('@')[0]] = { email, password };
	}
	writeFileSync(out, JSON.stringify(accounts, null, 2));
	console.log(`Test data added. Test passwords written to ${out}`);
} finally {
	await sql.end();
}
