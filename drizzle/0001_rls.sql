-- Row Level Security rules of the final report (section 7.0.6.3, Table 11).
-- They protect every request that reaches the tables through the Supabase API with a user's session.
-- The SvelteKit server connects as the table owner (DATABASE_URL), so it also checks the role on each page.

-- Role and department of the signed-in user. SECURITY DEFINER reads USER_T without its own RLS, so the policies do not loop.
CREATE FUNCTION public.satar_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT usr_role FROM user_t WHERE usr_id = auth.uid() AND usr_active $$;
--> statement-breakpoint
CREATE FUNCTION public.satar_dep() RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT dep_id FROM user_t WHERE usr_id = auth.uid() AND usr_active $$;
--> statement-breakpoint
ALTER TABLE user_t ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE department_t ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE category_t ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE tool_t ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE request_t ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_log_t ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- USER_T: own row; a Manager also reads the users of the same department; the Administrator reads, creates and updates.
CREATE POLICY user_read ON user_t FOR SELECT TO authenticated
	USING (usr_id = auth.uid() OR satar_role() = 'Administrator' OR (satar_role() = 'Manager' AND dep_id = satar_dep()));
--> statement-breakpoint
CREATE POLICY user_admin_insert ON user_t FOR INSERT TO authenticated WITH CHECK (satar_role() = 'Administrator');
--> statement-breakpoint
CREATE POLICY user_admin_update ON user_t FOR UPDATE TO authenticated USING (satar_role() = 'Administrator');
--> statement-breakpoint

-- DEPARTMENT_T and CATEGORY_T: everyone signed in reads; the Administrator creates and updates.
CREATE POLICY department_read ON department_t FOR SELECT TO authenticated USING (satar_role() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY department_admin_insert ON department_t FOR INSERT TO authenticated WITH CHECK (satar_role() = 'Administrator');
--> statement-breakpoint
CREATE POLICY department_admin_update ON department_t FOR UPDATE TO authenticated USING (satar_role() = 'Administrator');
--> statement-breakpoint
CREATE POLICY category_read ON category_t FOR SELECT TO authenticated USING (satar_role() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY category_admin_insert ON category_t FOR INSERT TO authenticated WITH CHECK (satar_role() = 'Administrator');
--> statement-breakpoint
CREATE POLICY category_admin_update ON category_t FOR UPDATE TO authenticated USING (satar_role() = 'Administrator');
--> statement-breakpoint

-- TOOL_T: everyone reads; an Employee creates a Pending tool; the Reviewer updates.
CREATE POLICY tool_read ON tool_t FOR SELECT TO authenticated USING (satar_role() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY tool_employee_insert ON tool_t FOR INSERT TO authenticated WITH CHECK (satar_role() = 'Employee' AND tol_status = 'Pending');
--> statement-breakpoint
CREATE POLICY tool_reviewer_update ON tool_t FOR UPDATE TO authenticated USING (satar_role() = 'Reviewer');
--> statement-breakpoint

-- REQUEST_T: an Employee reads and creates their own; a Manager reads the department's and decides 'Pending Manager' ones;
-- the Reviewer reads all and decides 'Pending Reviewer' ones; the Administrator reads all.
CREATE POLICY request_read ON request_t FOR SELECT TO authenticated USING (
	usr_id = auth.uid()
	OR satar_role() IN ('Reviewer', 'Administrator')
	OR (satar_role() = 'Manager' AND EXISTS (SELECT 1 FROM user_t u WHERE u.usr_id = request_t.usr_id AND u.dep_id = satar_dep())));
--> statement-breakpoint
CREATE POLICY request_employee_insert ON request_t FOR INSERT TO authenticated
	WITH CHECK (satar_role() = 'Employee' AND usr_id = auth.uid() AND req_status = 'Pending Manager');
--> statement-breakpoint
CREATE POLICY request_manager_update ON request_t FOR UPDATE TO authenticated
	USING (satar_role() = 'Manager' AND req_status = 'Pending Manager'
		AND EXISTS (SELECT 1 FROM user_t u WHERE u.usr_id = request_t.usr_id AND u.dep_id = satar_dep()))
	WITH CHECK (req_status IN ('Pending Reviewer', 'Rejected'));
--> statement-breakpoint
CREATE POLICY request_reviewer_update ON request_t FOR UPDATE TO authenticated
	USING (satar_role() = 'Reviewer' AND req_status = 'Pending Reviewer') WITH CHECK (req_status IN ('Approved', 'Rejected'));
--> statement-breakpoint

-- AUDIT_LOG_T: a Manager or a Reviewer adds their own decision records; the Administrator reads. No update, no delete.
CREATE POLICY audit_insert ON audit_log_t FOR INSERT TO authenticated
	WITH CHECK (satar_role() IN ('Manager', 'Reviewer') AND usr_id = auth.uid());
--> statement-breakpoint
CREATE POLICY audit_admin_read ON audit_log_t FOR SELECT TO authenticated USING (satar_role() = 'Administrator');
