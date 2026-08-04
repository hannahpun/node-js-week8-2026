CREATE TABLE "COURSE" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"max_participants" integer NOT NULL,
	"skill_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "COURSE_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "SKILL" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "SKILL_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "USER" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(320) NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "USER_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "COURSE" ADD CONSTRAINT "COURSE_skill_id_SKILL_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."SKILL"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "COURSE" ADD CONSTRAINT "COURSE_user_id_USER_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."USER"("id") ON DELETE cascade ON UPDATE no action;