import userSchema, { NewUser, UserSchema } from "@/data/schemas/user/entity";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, gt, and, or, like, gte, lte, asc, desc, SQL } from "drizzle-orm";
import { DatabaseResult, DatabaseErrorCode } from "@/utils/types/database";
import { mapDatabaseError } from "@/utils/helpers/mapDatabaseError";
import { UserListParams } from "@/data/schemas/user/types";
import {
  CursorPaginatedResult,
  normalizePagination,
} from "@/utils/types/pagination";

type Deps = {
  db: NodePgDatabase;
};

/**
 * Creates a user repository instance with CRUD operations for managing users in the database.
 *
 * @param deps - Dependencies object containing the database connection.
 * @param deps.db - The database instance used for executing queries.
 * @returns An object containing methods for user data operations:
 * - `create`: Creates a new user in the database
 * - `update`: Updates an existing user by ID
 * - `get`: Retrieves a user by ID
 * - `remove`: Deletes a user by ID
 *
 * @example
 * ```typescript
 * const repository = userRepository({ db: drizzleInstance });
 * const result = await repository.create({ name: "John", email: "john@example.com" });
 * if (result.ok) {
 *   console.log("User created:", result.data);
 * }
 * ```
 */
const userRepository = ({ db }: Deps) => {
  /**
   * Creates a new user in the database.
   * @param payload - The user data to insert.
   * @returns A `DatabaseResult` containing the created user or an error.
   */
  const create = async (
    payload: NewUser,
  ): Promise<DatabaseResult<UserSchema>> => {
    try {
      const res = await db.insert(userSchema).values(payload).returning();
      if (res.length > 0) {
        return { ok: true, data: res[0] };
      }
      return {
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data returned",
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  /**
   * Updates an existing user in the database.
   * @param id - The ID of the user to update.
   * @param payload - The partial user data to update.
   * @returns A `DatabaseResult` containing the updated user or an error.
   */
  const update = async (
    id: number,
    payload: Partial<NewUser>,
  ): Promise<DatabaseResult<UserSchema>> => {
    try {
      const res = await db
        .update(userSchema)
        .set(payload)
        .where(eq(userSchema.id, id))
        .returning();
      if (res.length > 0) {
        return { ok: true, data: res[0] };
      }
      return {
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data updated",
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns A `DatabaseResult` containing the user or an error.
   */
  const get = async (id: number): Promise<DatabaseResult<UserSchema>> => {
    try {
      const res = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, id));
      if (res.length > 0) {
        return { ok: true, data: res[0] };
      }
      return {
        ok: false,
        error: {
          code: DatabaseErrorCode.NotFound,
          message: "User not found",
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  /**
   * Retrieves a user from the database by their email address.
   *
   * @param email - The email address of the user to retrieve
   * @returns A promise that resolves to a DatabaseResult containing:
   *          - On success: The user data matching the email
   *          - On not found: An error with DatabaseErrorCode.NotFound
   *          - On failure: An error with the mapped database error
   */
  const getByEmail = async (
    email: string,
  ): Promise<DatabaseResult<UserSchema>> => {
    try {
      const res = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, email));
      if (res.length > 0) {
        return { ok: true, data: res[0] };
      }
      return {
        ok: false,
        error: {
          code: DatabaseErrorCode.NotFound,
          message: "User not found",
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  /**
   * Deletes a user by their ID.
   * @param id - The ID of the user to delete.
   * @returns A `DatabaseResult` containing the deleted user or an error.
   */
  const remove = async (id: number): Promise<DatabaseResult<UserSchema>> => {
    try {
      const res = await db
        .delete(userSchema)
        .where(eq(userSchema.id, id))
        .returning();
      if (res.length > 0) {
        return { ok: true, data: res[0] };
      }
      return {
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data deleted",
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  /**
   * Lists users with cursor-based pagination and filters.
   * @param params - Search and pagination parameters.
   * @returns A `DatabaseResult` containing paginated users or an error.
   */
  const list = async (
    params?: UserListParams,
  ): Promise<DatabaseResult<CursorPaginatedResult<UserSchema>>> => {
    try {
      const { cursor, limit } = normalizePagination(params);
      const filters = params?.filters;
      const sortBy = params?.sortBy || "id";
      const sortOrder = params?.sortOrder || "asc";

      // Build WHERE conditions
      const conditions: SQL[] = [];

      // Cursor condition (for pagination)
      if (cursor !== undefined) {
        if (sortOrder === "asc") {
          conditions.push(gt(userSchema.id, cursor));
        } else {
          // For desc order, we need to fetch items with id < cursor
          conditions.push(gt(userSchema.id, cursor)); // We'll reverse the logic in query
        }
      }

      // Apply filters
      if (filters) {
        if (filters.fullname) {
          conditions.push(like(userSchema.fullname, `%${filters.fullname}%`));
        }
        if (filters.username) {
          conditions.push(like(userSchema.username, `%${filters.username}%`));
        }
        if (filters.email) {
          conditions.push(like(userSchema.email, `%${filters.email}%`));
        }
        if (filters.phoneNumber) {
          conditions.push(
            like(userSchema.phoneNumber, `%${filters.phoneNumber}%`),
          );
        }
        if (filters.gender) {
          conditions.push(eq(userSchema.gender, filters.gender));
        }
        if (filters.roleType) {
          conditions.push(eq(userSchema.roleType, filters.roleType));
        }
        if (filters.status) {
          conditions.push(eq(userSchema.status, filters.status));
        }
        if (filters.createdAfter) {
          conditions.push(gte(userSchema.createdAt, filters.createdAfter));
        }
        if (filters.createdBefore) {
          conditions.push(lte(userSchema.createdAt, filters.createdBefore));
        }
      }

      // Build query
      let query = db
        .select()
        .from(userSchema)
        .limit(limit + 1); // Fetch one extra to determine if there's a next page

      // Apply WHERE clause
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      // Apply ORDER BY
      let orderByColumn;
      switch (sortBy) {
        case "id":
          orderByColumn = userSchema.id;
          break;
        case "createdAt":
          orderByColumn = userSchema.createdAt;
          break;
        case "updatedAt":
          orderByColumn = userSchema.updatedAt;
          break;
        case "fullname":
          orderByColumn = userSchema.fullname;
          break;
        default:
          orderByColumn = userSchema.id;
      }

      if (sortOrder === "asc") {
        query = query.orderBy(asc(orderByColumn)) as any;
      } else {
        query = query.orderBy(desc(orderByColumn)) as any;
      }

      const results = await query;

      // Determine if there's a next page
      const hasNextPage = results.length > limit;
      const data = hasNextPage ? results.slice(0, limit) : results;

      // Get the next cursor (ID of last item)
      const nextCursor =
        hasNextPage && data.length > 0 ? data[data.length - 1].id : undefined;

      return {
        ok: true,
        data: {
          data,
          pageInfo: {
            nextCursor,
            hasNextPage,
            count: data.length,
          },
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  return {
    create,
    update,
    get,
    getByEmail,
    remove,
    list,
  };
};

type UserRepository = ReturnType<typeof userRepository>;
export default userRepository;
export type { UserRepository };
