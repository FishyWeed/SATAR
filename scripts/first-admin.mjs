// Creates the first Administrator, so that someone can sign in and add the other users.
// Usage: npm run first-admin -- <email> <first name> <last name> [department]
// Then open the Sign In page, click "Forgot password?" and set the password from the email.
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

process.loadEnvFile();
const [email, first, last, dep = 'IT'] = process.argv.slice(2);
if (!email || !first || !last) {
	console.error('Usage: npm run first-admin -- <email> <first name> <last name> [department]');
	process.exit(1);
}

const auth = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).auth.admin;
const { data, error } = await auth.createUser({ email: email.toLowerCase(), email_confirm: true });
if (error) {
	console.error(`Supabase Auth: ${error.message}`);
	process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
try {
	await sql.begin(async (tx) => {
		const [d] = await tx`insert into department_t (dep_name) values (${dep}) on conflict (dep_name) do update set dep_name = excluded.dep_name returning dep_id`;
		await tx`insert into user_t (usr_id, usr_f_name, usr_l_name, usr_email, usr_role, dep_id) values (${data.user.id}, ${first}, ${last}, ${email.toLowerCase()}, 'Administrator', ${d.dep_id})`;
	});
	console.log(`Administrator ${email} created. On the Sign In page, use "Forgot password?" to set the password.`);
} catch (e) {
	await auth.deleteUser(data.user.id); // keep Auth and USER_T in step
	console.error(`Database: ${e.message}`);
	process.exitCode = 1;
} finally {
	await sql.end();
}
