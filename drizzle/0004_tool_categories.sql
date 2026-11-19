CREATE TABLE "tool_category_t" (
	"org_id" integer NOT NULL,
	"tol_id" integer NOT NULL,
	"cat_id" integer NOT NULL,
	CONSTRAINT "tool_category_t_tol_id_cat_id_pk" PRIMARY KEY("tol_id","cat_id")
);
--> statement-breakpoint
ALTER TABLE "tool_t" DROP CONSTRAINT "tool_t_cat_id_category_t_cat_id_fk";
--> statement-breakpoint
ALTER TABLE "tool_category_t" ADD CONSTRAINT "tool_category_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_category_t" ADD CONSTRAINT "tool_category_t_tol_id_tool_t_tol_id_fk" FOREIGN KEY ("tol_id") REFERENCES "public"."tool_t"("tol_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_category_t" ADD CONSTRAINT "tool_category_t_cat_id_category_t_cat_id_fk" FOREIGN KEY ("cat_id") REFERENCES "public"."category_t"("cat_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Keep every tool's current category: copy it into the link table before the column goes.
INSERT INTO "tool_category_t" ("org_id", "tol_id", "cat_id") SELECT "org_id", "tol_id", "cat_id" FROM "tool_t";--> statement-breakpoint
ALTER TABLE "tool_t" DROP COLUMN "cat_id";--> statement-breakpoint
-- TOOL_CATEGORY_T: members read; an Employee links the tool of a new request; the Administrator sets the tools of a category.
ALTER TABLE tool_category_t ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY tool_category_read ON tool_category_t FOR SELECT TO authenticated USING (org_id = satar_org());--> statement-breakpoint
CREATE POLICY tool_category_employee_insert ON tool_category_t FOR INSERT TO authenticated WITH CHECK (org_id = satar_org() AND satar_role() = 'Employee');--> statement-breakpoint
CREATE POLICY tool_category_admin_write ON tool_category_t FOR ALL TO authenticated
	USING (org_id = satar_org() AND satar_role() = 'Administrator') WITH CHECK (org_id = satar_org() AND satar_role() = 'Administrator');