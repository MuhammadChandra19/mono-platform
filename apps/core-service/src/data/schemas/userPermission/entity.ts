import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import userSchema from "../user/entity";
import permissionSchema from "../permission/entity";
import { WithoutTimestamps } from "@/utils/types/utils";

const userPermissionSchema = pgTable(
  "userPermission",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
      .references(() => userSchema.id)
      .notNull(),
    permissionId: varchar({ length: 255 })
      .references(() => permissionSchema.id)
      .notNull(),
    createdBy: varchar({ length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("user_permission_user_id").on(t.userId)],
);

type NewUserPermission = WithoutTimestamps<
  typeof userPermissionSchema.$inferInsert
>;
type UserPermissionSchema = typeof userPermissionSchema.$inferSelect;

export default userPermissionSchema;
export type { NewUserPermission, UserPermissionSchema };
