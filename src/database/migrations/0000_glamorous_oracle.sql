CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"bio" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
