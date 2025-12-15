CREATE TABLE "userPermission" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userPermission_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"permissionId" varchar(255) NOT NULL,
	"createdBy" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userPermission" ADD CONSTRAINT "userPermission_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userPermission" ADD CONSTRAINT "userPermission_permissionId_permission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_permission_user_id" ON "userPermission" USING btree ("userId");