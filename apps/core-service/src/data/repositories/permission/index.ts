import permissionSchema, {
  NewPermission,
  PermissionSchema,
} from "@/data/schemas/permission/entity";
import userPermissionSchema, {
  NewUserPermission,
  UserPermissionSchema,
} from "@/data/schemas/userPermission/entity";
import { mapDatabaseError } from "@/utils/helpers/mapDatabaseError";
import { DatabaseErrorCode, DatabaseResult } from "@/utils/types/database";
import { UserPermission } from "@packages/openapigen/src";
import { and, eq, inArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

type Deps = {
  db: NodePgDatabase;
};

const permissionRepository = ({ db }: Deps) => {
  const getPermission = async (
    id: string,
  ): Promise<DatabaseResult<PermissionSchema>> => {
    try {
      const res = await db
        .select()
        .from(permissionSchema)
        .where(eq(permissionSchema.id, id));
      if (res.length > 0) {
        return { ok: true, data: res[0] };
      }

      return {
        ok: false,
        error: {
          code: DatabaseErrorCode.NotFound,
          message: "Permission not found",
        },
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  const getPermissionByIds = async (
    ids: string[],
  ): Promise<DatabaseResult<PermissionSchema[]>> => {
    try {
      const res = await db
        .select()
        .from(permissionSchema)
        .where(inArray(permissionSchema.id, ids));
      if (res.length > 0) {
        return { ok: true, data: res };
      }

      return {
        ok: true,
        data: [],
      };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  const createPermission = async (
    payload: NewPermission[],
  ): Promise<DatabaseResult<PermissionSchema[]>> => {
    try {
      const res = await db.insert(permissionSchema).values(payload).returning();
      if (res.length > 0) {
        return { ok: true, data: res };
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

  const createUserPermission = async (
    payload: NewUserPermission[],
  ): Promise<DatabaseResult<UserPermissionSchema[]>> => {
    try {
      const res = await db
        .insert(userPermissionSchema)
        .values(payload)
        .returning();
      if (res.length > 0) {
        return { ok: true, data: res };
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

  const getUserPermissions = async (
    userId: number,
  ): Promise<DatabaseResult<UserPermissionSchema[]>> => {
    try {
      const res = await db
        .select()
        .from(userPermissionSchema)
        .where(eq(userPermissionSchema.userId, userId));
      if (res.length > 0) {
        return { ok: true, data: res };
      }

      return { ok: true, data: [] };
    } catch (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }
  };

  const deleteUserPermissions = async (
    userId: number,
    permissiondIds: string[],
  ): Promise<DatabaseResult<UserPermissionSchema[]>> => {
    try {
      const res = await db
        .delete(userPermissionSchema)
        .where(
          and(
            eq(userPermissionSchema.userId, userId),
            inArray(userPermissionSchema.permissionId, permissiondIds),
          ),
        )

        .returning();
      if (res.length > 0) {
        return { ok: true, data: res };
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
  return {
    getPermission,
    createPermission,
    getUserPermissions,
    createUserPermission,
    getPermissionByIds,
    deleteUserPermissions,
  };
};

type PermissionRepository = ReturnType<typeof permissionRepository>;
export default permissionRepository;
export type { PermissionRepository };
