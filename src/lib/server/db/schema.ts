// The tables of SATAR (final report, section 7.0.6.2). Column names follow the data dictionary.
// Every organization's data carries its org_id; one database serves all organizations.
import { pgTable, integer, varchar, uuid, boolean, date, timestamp, unique } from 'drizzle-orm/pg-core';
import type { UserRole, ToolStatus, Risk, DataClass, RequestStatus, Role } from '#lib/rules.ts';

export const organization = pgTable('organization_t', {
	org_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org_name: varchar({ length: 80 }).notNull(),
	org_active: boolean().notNull().default(true),
	org_created: timestamp({ withTimezone: true }).notNull().defaultNow()
});

export const department = pgTable('department_t', {
	dep_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org_id: integer().notNull().references(() => organization.org_id),
	dep_name: varchar({ length: 50 }).notNull()
}, (t) => [unique('department_t_org_name_unique').on(t.org_id, t.dep_name)]);

export const category = pgTable('category_t', {
	cat_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org_id: integer().notNull().references(() => organization.org_id),
	cat_name: varchar({ length: 50 }).notNull()
}, (t) => [unique('category_t_org_name_unique').on(t.org_id, t.cat_name)]);

// One row per person; usr_id is the id of the Supabase Auth account, which keeps the password.
// A person who has not created or joined an organization yet has no org_id, dep_id or role.
// The platform Owner has the role 'Owner' and no organization.
export const user = pgTable('user_t', {
	usr_id: uuid().primaryKey(),
	org_id: integer().references(() => organization.org_id),
	usr_f_name: varchar({ length: 50 }).notNull(),
	usr_l_name: varchar({ length: 50 }).notNull(),
	usr_email: varchar({ length: 60 }).notNull().unique(),
	usr_role: varchar({ length: 15 }).$type<UserRole>(),
	dep_id: integer().references(() => department.dep_id),
	usr_active: boolean().notNull().default(true)
});

export const tool = pgTable('tool_t', {
	tol_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org_id: integer().notNull().references(() => organization.org_id),
	tol_name: varchar({ length: 60 }).notNull(),
	tol_vendor: varchar({ length: 60 }).notNull(),
	tol_url: varchar({ length: 200 }).notNull(),
	cat_id: integer().notNull().references(() => category.cat_id),
	tol_status: varchar({ length: 10 }).$type<ToolStatus>().notNull().default('Pending'),
	tol_risk: varchar({ length: 6 }).$type<Risk>(),
	tol_data_class: varchar({ length: 12 }).$type<DataClass>(),
	tol_conditions: varchar({ length: 500 }),
	tol_review_date: date({ mode: 'string' })
}, (t) => [unique('tool_t_org_name_unique').on(t.org_id, t.tol_name)]);

export const request = pgTable('request_t', {
	req_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org_id: integer().notNull().references(() => organization.org_id),
	usr_id: uuid().notNull().references(() => user.usr_id),
	tol_id: integer().notNull().references(() => tool.tol_id),
	req_purpose: varchar({ length: 500 }).notNull(),
	req_data_class: varchar({ length: 12 }).$type<DataClass>().notNull(),
	req_status: varchar({ length: 20 }).$type<RequestStatus>().notNull().default('Pending Manager'),
	req_mgr_note: varchar({ length: 500 }),
	req_rev_note: varchar({ length: 500 }),
	req_date: timestamp({ withTimezone: true }).notNull().defaultNow()
});

// Rows are only ever inserted: the RLS rules give nobody update or delete.
export const audit = pgTable('audit_log_t', {
	aud_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org_id: integer().notNull().references(() => organization.org_id),
	usr_id: uuid().notNull().references(() => user.usr_id),
	tol_id: integer().notNull().references(() => tool.tol_id),
	aud_action: varchar({ length: 30 }).notNull(),
	aud_reason: varchar({ length: 500 }).notNull(),
	aud_time: timestamp({ withTimezone: true }).notNull().defaultNow()
});

// An invite link: an Administrator chooses the role and department; the link works once, until it expires.
export const invite = pgTable('invite_t', {
	inv_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	inv_code: varchar({ length: 40 }).notNull().unique(),
	org_id: integer().notNull().references(() => organization.org_id),
	dep_id: integer().notNull().references(() => department.dep_id),
	usr_role: varchar({ length: 15 }).$type<Role>().notNull(),
	inv_email: varchar({ length: 60 }),
	inv_expires: timestamp({ withTimezone: true }).notNull(),
	inv_created_by: uuid().notNull().references(() => user.usr_id),
	inv_used_by: uuid().references(() => user.usr_id),
	inv_created: timestamp({ withTimezone: true }).notNull().defaultNow()
});
