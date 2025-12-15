import { WithoutTimestamps } from "@/utils/types/utils";
import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

const permissionSchema = pgTable(
  "permission",
  {
    id: varchar({ length: 255 }).primaryKey(),
    action: varchar({ length: 100 }),
    resourceName: varchar({ length: 255 }),
    description: varchar({ length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("permission_idx").on(t.id)],
);

type NewPermission = WithoutTimestamps<typeof permissionSchema.$inferInsert>;
type PermissionSchema = typeof permissionSchema.$inferSelect;

export default permissionSchema;
export type { NewPermission, PermissionSchema };
