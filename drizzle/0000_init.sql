CREATE TABLE "audit_log_t" (
	"aud_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_t_aud_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"usr_id" uuid NOT NULL,
	"tol_id" integer NOT NULL,
	"aud_action" varchar(30) NOT NULL,
	"aud_reason" varchar(500) NOT NULL,
	"aud_time" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_t" (
	"cat_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "category_t_cat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cat_name" varchar(50) NOT NULL,
	CONSTRAINT "category_t_cat_name_unique" UNIQUE("cat_name")
);
--> statement-breakpoint
CREATE TABLE "department_t" (
	"dep_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "department_t_dep_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"dep_name" varchar(50) NOT NULL,
	CONSTRAINT "department_t_dep_name_unique" UNIQUE("dep_name")
);
--> statement-breakpoint
CREATE TABLE "request_t" (
	"req_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "request_t_req_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"usr_id" uuid NOT NULL,
	"tol_id" integer NOT NULL,
	"req_purpose" varchar(500) NOT NULL,
	"req_data_class" varchar(12) NOT NULL,
	"req_status" varchar(20) DEFAULT 'Pending Manager' NOT NULL,
	"req_mgr_note" varchar(500),
	"req_rev_note" varchar(500),
	"req_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_t" (
	"tol_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tool_t_tol_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tol_name" varchar(60) NOT NULL,
	"tol_vendor" varchar(60) NOT NULL,
	"tol_url" varchar(200) NOT NULL,
	"cat_id" integer NOT NULL,
	"tol_status" varchar(10) DEFAULT 'Pending' NOT NULL,
	"tol_risk" varchar(6),
	"tol_data_class" varchar(12),
	"tol_conditions" varchar(500),
	"tol_review_date" date,
	CONSTRAINT "tool_t_tol_name_unique" UNIQUE("tol_name")
);
--> statement-breakpoint
CREATE TABLE "user_t" (
	"usr_id" uuid PRIMARY KEY NOT NULL,
	"usr_f_name" varchar(50) NOT NULL,
	"usr_l_name" varchar(50) NOT NULL,
	"usr_email" varchar(60) NOT NULL,
	"usr_role" varchar(15) NOT NULL,
	"dep_id" integer NOT NULL,
	"usr_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_t_usr_email_unique" UNIQUE("usr_email")
);
--> statement-breakpoint
ALTER TABLE "audit_log_t" ADD CONSTRAINT "audit_log_t_usr_id_user_t_usr_id_fk" FOREIGN KEY ("usr_id") REFERENCES "public"."user_t"("usr_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log_t" ADD CONSTRAINT "audit_log_t_tol_id_tool_t_tol_id_fk" FOREIGN KEY ("tol_id") REFERENCES "public"."tool_t"("tol_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_t" ADD CONSTRAINT "request_t_usr_id_user_t_usr_id_fk" FOREIGN KEY ("usr_id") REFERENCES "public"."user_t"("usr_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_t" ADD CONSTRAINT "request_t_tol_id_tool_t_tol_id_fk" FOREIGN KEY ("tol_id") REFERENCES "public"."tool_t"("tol_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_t" ADD CONSTRAINT "tool_t_cat_id_category_t_cat_id_fk" FOREIGN KEY ("cat_id") REFERENCES "public"."category_t"("cat_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_t" ADD CONSTRAINT "user_t_dep_id_department_t_dep_id_fk" FOREIGN KEY ("dep_id") REFERENCES "public"."department_t"("dep_id") ON DELETE no action ON UPDATE no action;