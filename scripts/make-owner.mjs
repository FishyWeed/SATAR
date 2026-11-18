// Makes an existing account the platform Owner: it leaves its organization and sees the Organizations page.
// Usage: npm run make-owner -- <email>
import postgres from 'postgres';

process.loadEnvFile();
const email = process.argv[2]?.toLowerCase();
if (!email) {
	console.error('Usage: npm run make-owner -- <email>');
	process.exit(1);
}
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const rows = await sql`update user_t set usr_role = 'Owner', org_id = null, dep_id = null, usr_active = true where usr_email = ${email} returning usr_id`;
await sql.end();
console.log(rows.length ? `${email} is now the platform Owner.` : `No account with the email ${email}. Sign up first.`);
process.exitCode = rows.length ? 0 : 1;
