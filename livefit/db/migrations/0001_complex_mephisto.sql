ALTER TABLE "COURSE" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "COURSE" ADD COLUMN "meeting_url" varchar(2048);