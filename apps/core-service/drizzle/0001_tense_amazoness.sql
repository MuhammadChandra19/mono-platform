CREATE TABLE "permission" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"action" varchar(100),
	"resourceName" varchar(255),
	"description" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "permission_idx" ON "permission" USING btree ("id");