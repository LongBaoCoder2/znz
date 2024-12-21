CREATE TYPE "public"."meeting_member_role" AS ENUM('host', 'participant');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('created', 'scheduled', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('request', 'joined', 'leave');--> statement-breakpoint
CREATE TABLE "meeting_member" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"user_id" integer,
	"display_name" varchar(255) NOT NULL,
	"joined_at" timestamp,
	"role" "meeting_member_role" DEFAULT 'participant'
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"display_id" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"pwd_salt" varchar(255),
	"uri" varchar(255) NOT NULL,
	"host" integer NOT NULL,
	"created_at" timestamp,
	"status" "meeting_status" DEFAULT 'created',
	CONSTRAINT "meetings_display_id_unique" UNIQUE("display_id"),
	CONSTRAINT "meetings_uri_unique" UNIQUE("uri")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" varchar(1000) NOT NULL,
	"created_at" timestamp,
	"is_pinned" boolean DEFAULT false,
	"to_user" integer
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(255),
	"avatar_url" varchar(255),
	"created_at" timestamp,
	"last_login_at" timestamp,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"email" varchar(255),
	"password_hash" text,
	"pwd_salt" text,
	"email_verified" timestamp
);
--> statement-breakpoint
ALTER TABLE "meeting_member" ADD CONSTRAINT "meeting_member_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_member" ADD CONSTRAINT "meeting_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_host_user_id_fk" FOREIGN KEY ("host") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_to_user_user_id_fk" FOREIGN KEY ("to_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;