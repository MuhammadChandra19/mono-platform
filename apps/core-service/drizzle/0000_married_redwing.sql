CREATE TYPE "public"."gender" AS ENUM('GENDER_UNSPECIFIED', 'MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('USER');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('USER_STATUS_UNSPECIFIED', 'USER_STATUS_ACTIVE', 'USER_STATUS_INACTIVE');--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fullname" varchar(255) NOT NULL,
	"username" varchar(100),
	"phone_number" varchar(50),
	"email" varchar(255),
	"profile_pic" varchar(500),
	"address" jsonb,
	"gender" "gender",
	"date_of_birth" timestamp with time zone,
	"place_of_birth" varchar(255),
	"role_type" "role_type",
	"status" "user_status" DEFAULT 'USER_STATUS_ACTIVE',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"password" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_phone_number_idx" ON "user" USING btree ("phone_number");