-- Row Level Security for many organizations: every rule of 0001_rls.sql now also requires the row's org_id
-- to be the organization of the signed-in user. The Owner sees organizations, but no data inside them.

CREATE FUNCTION public.satar_org() RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT u.org_id FROM user_t u JOIN organization_t o ON o.org_id = u.org_id WHERE u.usr_id = auth.uid() AND u.usr_active AND o.org_active $$;
--> statement-breakpoint
DROP POLICY user_read ON user_t;--> statement-breakpoint
DROP POLICY user_admin_insert ON user_t;--> statement-breakpoint
DROP POLICY user_admin_update ON user_t;--> statement-breakpoint
DROP POLICY department_read ON department_t;--> statement-breakpoint
DROP POLICY department_admin_insert ON department_t;--> statement-breakpoint
DROP POLICY department_admin_update ON department_t;--> statement-breakpoint
DROP POLICY category_read ON category_t;--> statement-breakpoint
DROP POLICY category_admin_insert ON category_t;--> statement-breakpoint
DROP POLICY category_admin_update ON category_t;--> statement-breakpoint
DROP POLICY tool_read ON tool_t;--> statement-breakpoint
DROP POLICY tool_employee_insert ON tool_t;--> statement-breakpoint
DROP POLICY tool_reviewer_update ON tool_t;--> statement-breakpoint
DROP POLICY request_read ON request_t;--> statement-breakpoint
DROP POLICY request_employee_insert ON request_t;--> statement-breakpoint
DROP POLICY request_manager_update ON request_t;--> statement-breakpoint
DROP POLICY request_reviewer_update ON request_t;--> statement-breakpoint
DROP POLICY audit_insert ON audit_log_t;--> statement-breakpoint
DROP POLICY audit_admin_read ON audit_log_t;--> statement-breakpoint
ALTER TABLE organization_t ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE invite_t ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- ORGANIZATION_T: members read their own organization; the Owner reads and updates (activates) all.
CREATE POLICY org_read ON organization_t FOR SELECT TO authenticated USING (org_id = satar_org() OR satar_role() = 'Owner');--> statement-breakpoint
CREATE POLICY org_owner_update ON organization_t FOR UPDATE TO authenticated USING (satar_role() = 'Owner');--> statement-breakpoint

-- USER_T: own row; a Manager also reads the users of the department; the Administrator reads and updates the organization's users.
CREATE POLICY user_read ON user_t FOR SELECT TO authenticated USING (
	usr_id = auth.uid()
	OR (org_id = satar_org() AND (satar_role() = 'Administrator' OR (satar_role() = 'Manager' AND dep_id = satar_dep()))));--> statement-breakpoint
CREATE POLICY user_admin_update ON user_t FOR UPDATE TO authenticated USING (org_id = satar_org() AND satar_role() = 'Administrator');--> statement-breakpoint

-- DEPARTMENT_T and CATEGORY_T: members read their organization's rows; the Administrator creates and updates them.
CREATE POLICY department_read ON department_t FOR SELECT TO authenticated USING (org_id = satar_org());--> statement-breakpoint
CREATE POLICY department_admin_write ON department_t FOR ALL TO authenticated
	USING (org_id = satar_org() AND satar_role() = 'Administrator') WITH CHECK (org_id = satar_org() AND satar_role() = 'Administrator');--> statement-breakpoint
CREATE POLICY category_read ON category_t FOR SELECT TO authenticated USING (org_id = satar_org());--> statement-breakpoint
CREATE POLICY category_admin_write ON category_t FOR ALL TO authenticated
	USING (org_id = satar_org() AND satar_role() = 'Administrator') WITH CHECK (org_id = satar_org() AND satar_role() = 'Administrator');--> statement-breakpoint

-- TOOL_T: members read; an Employee creates a Pending tool; the Reviewer updates the risk; the Administrator moves tools between categories.
CREATE POLICY tool_read ON tool_t FOR SELECT TO authenticated USING (org_id = satar_org());--> statement-breakpoint
CREATE POLICY tool_employee_insert ON tool_t FOR INSERT TO authenticated WITH CHECK (org_id = satar_org() AND satar_role() = 'Employee' AND tol_status = 'Pending');--> statement-breakpoint
CREATE POLICY tool_staff_update ON tool_t FOR UPDATE TO authenticated USING (org_id = satar_org() AND satar_role() IN ('Reviewer', 'Administrator'));--> statement-breakpoint

-- REQUEST_T: as before, inside the organization.
CREATE POLICY request_read ON request_t FOR SELECT TO authenticated USING (org_id = satar_org() AND (
	usr_id = auth.uid()
	OR satar_role() IN ('Reviewer', 'Administrator')
	OR (satar_role() = 'Manager' AND EXISTS (SELECT 1 FROM user_t u WHERE u.usr_id = request_t.usr_id AND u.dep_id = satar_dep()))));--> statement-breakpoint
CREATE POLICY request_employee_insert ON request_t FOR INSERT TO authenticated
	WITH CHECK (org_id = satar_org() AND satar_role() = 'Employee' AND usr_id = auth.uid() AND req_status = 'Pending Manager');--> statement-breakpoint
CREATE POLICY request_manager_update ON request_t FOR UPDATE TO authenticated
	USING (org_id = satar_org() AND satar_role() = 'Manager' AND req_status = 'Pending Manager'
		AND EXISTS (SELECT 1 FROM user_t u WHERE u.usr_id = request_t.usr_id AND u.dep_id = satar_dep()))
	WITH CHECK (req_status IN ('Pending Reviewer', 'Rejected'));--> statement-breakpoint
CREATE POLICY request_reviewer_update ON request_t FOR UPDATE TO authenticated
	USING (org_id = satar_org() AND satar_role() = 'Reviewer' AND req_status = 'Pending Reviewer') WITH CHECK (req_status IN ('Approved', 'Rejected'));--> statement-breakpoint

-- AUDIT_LOG_T: Managers and Reviewers add their own records; the Administrator reads the organization's log.
CREATE POLICY audit_insert ON audit_log_t FOR INSERT TO authenticated
	WITH CHECK (org_id = satar_org() AND satar_role() IN ('Manager', 'Reviewer') AND usr_id = auth.uid());--> statement-breakpoint
CREATE POLICY audit_admin_read ON audit_log_t FOR SELECT TO authenticated USING (org_id = satar_org() AND satar_role() = 'Administrator');--> statement-breakpoint

-- INVITE_T: the Administrator creates, reads and cancels the organization's invites.
CREATE POLICY invite_admin ON invite_t FOR ALL TO authenticated
	USING (org_id = satar_org() AND satar_role() = 'Administrator') WITH CHECK (org_id = satar_org() AND satar_role() = 'Administrator');
