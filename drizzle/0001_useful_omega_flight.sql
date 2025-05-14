ALTER TABLE "sessions" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "ended_at";--> statement-breakpoint
DROP TYPE "public"."session_status";