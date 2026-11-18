CREATE TABLE "invite_t" (
	"inv_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invite_t_inv_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"inv_code" varchar(40) NOT NULL,
	"org_id" integer NOT NULL,
	"dep_id" integer NOT NULL,
	"usr_role" varchar(15) NOT NULL,
	"inv_email" varchar(60),
	"inv_expires" timestamp with time zone NOT NULL,
	"inv_created_by" uuid NOT NULL,
	"inv_used_by" uuid,
	"inv_created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invite_t_inv_code_unique" UNIQUE("inv_code")
);
--> statement-breakpoint
CREATE TABLE "organization_t" (
	"org_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_t_org_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_name" varchar(80) NOT NULL,
	"org_active" boolean DEFAULT true NOT NULL,
	"org_created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- The data from before organizations existed becomes the organization "Noctua Demo".
INSERT INTO "organization_t" ("org_name") VALUES ('Noctua Demo');--> statement-breakpoint
ALTER TABLE "category_t" DROP CONSTRAINT "category_t_cat_name_unique";--> statement-breakpoint
ALTER TABLE "department_t" DROP CONSTRAINT "department_t_dep_name_unique";--> statement-breakpoint
ALTER TABLE "tool_t" DROP CONSTRAINT "tool_t_tol_name_unique";--> statement-breakpoint
ALTER TABLE "user_t" ALTER COLUMN "usr_role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_t" ALTER COLUMN "dep_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log_t" ADD COLUMN "org_id" integer;--> statement-breakpoint
UPDATE "audit_log_t" SET "org_id" = (SELECT min("org_id") FROM "organization_t");--> statement-breakpoint
ALTER TABLE "audit_log_t" ALTER COLUMN "org_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category_t" ADD COLUMN "org_id" integer;--> statement-breakpoint
UPDATE "category_t" SET "org_id" = (SELECT min("org_id") FROM "organization_t");--> statement-breakpoint
ALTER TABLE "category_t" ALTER COLUMN "org_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "department_t" ADD COLUMN "org_id" integer;--> statement-breakpoint
UPDATE "department_t" SET "org_id" = (SELECT min("org_id") FROM "organization_t");--> statement-breakpoint
ALTER TABLE "department_t" ALTER COLUMN "org_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "request_t" ADD COLUMN "org_id" integer;--> statement-breakpoint
UPDATE "request_t" SET "org_id" = (SELECT min("org_id") FROM "organization_t");--> statement-breakpoint
ALTER TABLE "request_t" ALTER COLUMN "org_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_t" ADD COLUMN "org_id" integer;--> statement-breakpoint
UPDATE "tool_t" SET "org_id" = (SELECT min("org_id") FROM "organization_t");--> statement-breakpoint
ALTER TABLE "tool_t" ALTER COLUMN "org_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_t" ADD COLUMN "org_id" integer;--> statement-breakpoint
UPDATE "user_t" SET "org_id" = (SELECT min("org_id") FROM "organization_t");--> statement-breakpoint
ALTER TABLE "invite_t" ADD CONSTRAINT "invite_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_t" ADD CONSTRAINT "invite_t_dep_id_department_t_dep_id_fk" FOREIGN KEY ("dep_id") REFERENCES "public"."department_t"("dep_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_t" ADD CONSTRAINT "invite_t_inv_created_by_user_t_usr_id_fk" FOREIGN KEY ("inv_created_by") REFERENCES "public"."user_t"("usr_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_t" ADD CONSTRAINT "invite_t_inv_used_by_user_t_usr_id_fk" FOREIGN KEY ("inv_used_by") REFERENCES "public"."user_t"("usr_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log_t" ADD CONSTRAINT "audit_log_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_t" ADD CONSTRAINT "category_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_t" ADD CONSTRAINT "department_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_t" ADD CONSTRAINT "request_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_t" ADD CONSTRAINT "tool_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_t" ADD CONSTRAINT "user_t_org_id_organization_t_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization_t"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_t" ADD CONSTRAINT "category_t_org_name_unique" UNIQUE("org_id","cat_name");--> statement-breakpoint
ALTER TABLE "department_t" ADD CONSTRAINT "department_t_org_name_unique" UNIQUE("org_id","dep_name");--> statement-breakpoint
ALTER TABLE "tool_t" ADD CONSTRAINT "tool_t_org_name_unique" UNIQUE("org_id","tol_name");