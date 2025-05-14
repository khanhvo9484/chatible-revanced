CREATE TYPE "public"."session_status" AS ENUM('active', 'ended');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" text NOT NULL,
	"user2_id" text NOT NULL,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"ended_at" timestamp
);
