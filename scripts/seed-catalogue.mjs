// Adds the demo catalogue (scripts/catalogue.json: 50 AI tools in 11 categories) to one organization. A tool can be in more
// than one category (a list in the JSON). Tools and categories that already exist keep their data. Usage: npm run seed-catalogue -- "Noctua Demo"
import postgres from 'postgres';
import { readFileSync } from 'node:fs';

process.loadEnvFile();
const orgName = process.argv[2];
if (!orgName) {
	console.error('Usage: npm run seed-catalogue -- "<organization name>"');
	process.exit(1);
}
const { categories, tools } = JSON.parse(readFileSync(new URL('./catalogue.json', import.meta.url), 'utf8'));
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
try {
	const [org] = await sql`select org_id from organization_t where org_name = ${orgName}`;
	if (!org) throw new Error(`No organization named ${orgName}`);
	for (const c of categories) await sql`insert into category_t (org_id, cat_name) values (${org.org_id}, ${c}) on conflict do nothing`;
	let added = 0;
	for (const [name, vendor, url, cats, status, risk, dataClass, conditions, reviewDate] of tools) {
		const [t] = await sql`insert into tool_t (org_id, tol_name, tol_vendor, tol_url, tol_status, tol_risk, tol_data_class, tol_conditions, tol_review_date)
			values (${org.org_id}, ${name}, ${vendor}, ${url}, ${status}, ${risk}, ${dataClass}, ${conditions}, ${reviewDate}) on conflict do nothing returning tol_id`;
		if (!t) continue;
		added++;
		for (const cat of [cats].flat()) {
			const [c] = await sql`select cat_id from category_t where org_id = ${org.org_id} and cat_name = ${cat}`;
			await sql`insert into tool_category_t (org_id, tol_id, cat_id) values (${org.org_id}, ${t.tol_id}, ${c.cat_id})`;
		}
	}
	console.log(`${orgName}: ${added} of ${tools.length} tools added, ${categories.length} categories.`);
} finally {
	await sql.end();
}
