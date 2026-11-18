import { eq } from 'drizzle-orm';
import { db, department, user } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	users: await db
		.select({ id: user.usr_id, first: user.usr_f_name, last: user.usr_l_name, email: user.usr_email, role: user.usr_role, department: department.dep_name, active: user.usr_active })
		.from(user).innerJoin(department, eq(user.dep_id, department.dep_id))
		.orderBy(user.usr_f_name, user.usr_l_name)
});
