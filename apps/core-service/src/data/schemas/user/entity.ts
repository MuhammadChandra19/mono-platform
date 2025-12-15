import {
  integer,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  Address,
  UserGenderEnum,
  UserRoleTypeEnum,
  UserStatusEnum,
} from "@packages/openapigen";
import { WithoutTimestamps } from "@/utils/types/utils";

export const genderEnum = pgEnum("gender", [
  UserGenderEnum.GenderUnspecified,
  UserGenderEnum.Male,
  UserGenderEnum.Female,
] as const);
export const roleTypeEnum = pgEnum("role_type", [
  UserRoleTypeEnum.User,
] as const);
export const userStatusEnum = pgEnum("user_status", [
  UserStatusEnum.UserStatusUnspecified,
  UserStatusEnum.UserStatusActive,
  UserStatusEnum.UserStatusInactive,
] as const);

const userSchema = pgTable(
  "user",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fullname: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 100 }),
    phoneNumber: varchar("phone_number", { length: 50 }),
    email: varchar({ length: 255 }),
    profilePic: varchar("profile_pic", { length: 500 }),
    address: jsonb().$type<Address>(),
    gender: genderEnum(),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    placeOfBirth: varchar("place_of_birth", { length: 255 }),
    roleType: roleTypeEnum("role_type"),
    status: userStatusEnum().default(UserStatusEnum.UserStatusActive),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    password: varchar({ length: 255 }).notNull(),
  },
  (t) => [
    // Unique indexes
    uniqueIndex("user_email_idx").on(t.email),
    uniqueIndex("user_username_idx").on(t.username),

    // Regular indexes
    index("user_phone_number_idx").on(t.phoneNumber),
  ],
);

type NewUser = WithoutTimestamps<typeof userSchema.$inferInsert>;
type UserSchema = typeof userSchema.$inferSelect;

export default userSchema;
export type { NewUser, UserSchema };
