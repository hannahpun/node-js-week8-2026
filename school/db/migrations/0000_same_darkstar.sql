CREATE TABLE "CLASS" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "CLASS_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "GRADE" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"score" integer NOT NULL,
	"student_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "STUDENT" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"class_id" uuid NOT NULL,
	CONSTRAINT "STUDENT_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "SUBJECT" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "SUBJECT_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "GRADE" ADD CONSTRAINT "GRADE_student_id_STUDENT_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."STUDENT"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GRADE" ADD CONSTRAINT "GRADE_subject_id_SUBJECT_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."SUBJECT"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "STUDENT" ADD CONSTRAINT "STUDENT_class_id_CLASS_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."CLASS"("id") ON DELETE cascade ON UPDATE no action;