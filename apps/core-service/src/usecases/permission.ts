import { PermissionRepository } from "@/data/repositories/permission";
import {
  NewPermission,
  PermissionSchema,
} from "@/data/schemas/permission/entity";
import {
  NewUserPermission,
  UserPermissionSchema,
} from "@/data/schemas/userPermission/entity";
import { Result, err, ok } from "@/utils/types/result";
import { TransactionWrapper } from "@packages/pkg/postgres";

type Deps = {
  permissionRepo: PermissionRepository;
  txWrapper: TransactionWrapper;
};

const permissionUsecase = ({ permissionRepo, txWrapper }: Deps) => {
  const getUserPermissions = async (
    userId: number,
  ): Promise<Result<UserPermissionSchema[]>> => {
    const result = await permissionRepo.getUserPermissions(userId);
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  const assignPermissionToUser = async (
    userId: number,
    author: string,
    permissionIds: string[],
  ): Promise<Result<UserPermissionSchema[]>> => {
    const permissionsResult =
      await permissionRepo.getPermissionByIds(permissionIds);
    if (!permissionsResult.ok) {
      return err({
        code: permissionsResult.error.code,
        message: permissionsResult.error.message,
        details: permissionsResult.error.details,
      });
    }
    const permissionMap = addPermissionToMap(permissionsResult.data);

    const result = await txWrapper(async () => {
      const emptyPermissions = mapEmptyPermission(permissionIds, permissionMap);
      if (emptyPermissions.length > 0) {
        const createResult =
          await permissionRepo.createPermission(emptyPermissions);
        if (!createResult.ok) {
          return err({
            code: createResult.error.code,
            message: createResult.error.message,
            details: createResult.error.details,
          });
        }
      }
      const payloadArr = createUserPermissionsPayload(
        {
          permissionId: "",
          userId,
          createdBy: author,
        },
        permissionIds,
      );
      const assignResult =
        await permissionRepo.createUserPermission(payloadArr);
      if (!assignResult.ok) {
        return err({
          code: assignResult.error.code,
          message: assignResult.error.message,
          details: assignResult.error.details,
        });
      }

      return ok(assignResult.data);
    });

    return result;
  };

  const deleteUserPermissions = async (
    userId: number,
    permissiondIds: string[],
  ) => {
    const result = await permissionRepo.deleteUserPermissions(
      userId,
      permissiondIds,
    );
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  const addPermissionToMap = (permissions: PermissionSchema[]) => {
    const permissionMap = new Map<string, PermissionSchema>();

    for (let i = 0; i < permissions.length; i++) {
      const permission = permissionMap.get(permissions[i].id);
      if (!permission) {
        permissionMap.set(permissions[i].id, permissions[i]);
      }
    }

    return permissionMap;
  };

  const mapEmptyPermission = (
    permissionIds: string[],
    permissions: Map<string, PermissionSchema>,
  ) => {
    const emptyPermissions: NewPermission[] = [];

    for (let i = 0; i < permissionIds.length; i++) {
      const permission = permissions.get(permissionIds[i]);
      if (!permission) {
        const [action, resourceName] = permissionIds[i].split(":");
        emptyPermissions.push({
          id: permissionIds[i],
          action: action,
          resourceName,
        });
      }
    }

    return emptyPermissions;
  };

  const createUserPermissionsPayload = (
    payload: NewUserPermission,
    permissionIds: string[],
  ) => {
    const payloadArr: NewUserPermission[] = [];
    for (let i = 0; i < permissionIds.length; i++) {
      payloadArr.push({
        permissionId: permissionIds[i],
        userId: payload.userId,
        createdBy: payload.createdBy,
      });
    }

    return payloadArr;
  };

  return {
    getUserPermissions,
    assignPermissionToUser,
    deleteUserPermissions,
  };
};

type PermissionUsecase = ReturnType<typeof permissionUsecase>;
export default permissionUsecase;
export type { PermissionUsecase };
