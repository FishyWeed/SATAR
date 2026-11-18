// The six tables of SATAR (final report, section 7.0.6.2). Column names follow the data dictionary.
import { pgTable, integer, varchar, uuid, boolean, date, timestamp } from 'drizzle-orm/pg-core';
import type { Role, ToolStatus, Risk, DataClass, RequestStatus } from '#lib/rules.ts';

export const department = pgTable('department_t', {
	dep_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	dep_name: varchar({ length: 50 }).notNull().unique()
});

export const category = pgTable('category_t', {
	cat_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	cat_name: varchar({ length: 50 }).notNull().unique()
});

// One row per user of every role; usr_id is the id of the Supabase Auth account, which keeps the password.
export const user = pgTable('user_t', {
	usr_id: uuid().primaryKey(),
	usr_f_name: varchar({ length: 50 }).notNull(),
	usr_l_name: varchar({ length: 50 }).notNull(),
	usr_email: varchar({ length: 60 }).notNull().unique(),
	usr_role: varchar({ length: 15 }).$type<Role>().notNull(),
	dep_id: integer().notNull().references(() => department.dep_id),
	usr_active: boolean().notNull().default(true)
});

export const tool = pgTable('tool_t', {
	tol_id: integer().primaryKey().generatedAlwaysAsIdentity(),
	tol_name: varchar({ length: 60 }).notNull().unique(),
	tol_vendor: varchar({ length: 60 }).notNull(),
	tol_url: varchar({ length: 200 }).notNull(),
	cat_id: integer().notNull().references(() => category.cat_id),
	tol_status: varchar({ length: 10 }).$type<ToolStatus>().notNull().default('Pending'),
	tol_risk: varchar({ length: 6 }).$type<Risk>(),
	tol_data_class: varchar({ length: 12 }).$type<DataClass>(),
	tol_conditions: varchar({ length: 500 }),
	tol_review_date: date({ mode: 'string' })
});

export const request = pgTable('request_t', {
	req_id: integer().primaryKey().generatedAlwaysAsIdentity(),
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
	usr_id: uuid().notNull().references(() => user.usr_id),
	tol_id: integer().notNull().references(() => tool.tol_id),
	aud_action: varchar({ length: 30 }).notNull(),
	aud_reason: varchar({ length: 500 }).notNull(),
	aud_time: timestamp({ withTimezone: true }).notNull().defaultNow()
});
