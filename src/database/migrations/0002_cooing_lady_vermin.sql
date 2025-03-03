CREATE TYPE "public"."user_role" AS ENUM('client', 'admin');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'client' NOT NULL;