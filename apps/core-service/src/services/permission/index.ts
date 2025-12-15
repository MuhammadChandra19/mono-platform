import { PermissionUsecase } from "@/usecases/permission";
import {
  toServiceError,
  toServiceSuccess,
  toServiceException,
} from "@/utils/helpers/serviceResult";
import {
  AssignUserPermissionResponse,
  GetUserPermissionsResponse,
  PermissionServiceApiImpl,
  RevokePermissionResponse,
  ServiceResult,
} from "@packages/openapigen";
import {
  PermissionServiceApiOperationScopesMap,
  PermissionServiceAssignPermissionRequest,
  PermissionServiceGetUserPermissionsRequest,
  PermissionServiceRevokePermissionRequest,
} from "@packages/openapigen/src/modules/authentication/v1/apis/PermissionServiceApi/client";
import { Authenticator } from "@packages/pkg/oauth";
import { Context } from "hono";
type Deps = {
  permissionUsecase: PermissionUsecase;
  authenticator: Authenticator;
};

const permissionService = ({
  permissionUsecase,
  authenticator,
}: Deps): PermissionServiceApiImpl => {
  const permissionServiceAssignPermission = async (
    c: Context,
    params: PermissionServiceAssignPermissionRequest,
  ): Promise<ServiceResult<AssignUserPermissionResponse>> => {
    try {
      const authResult = await authenticator.mustHaveArrScopes(
        c,
        {
          USER: true,
        },
        PermissionServiceApiOperationScopesMap.permissionServiceAssignPermission,
      );

      if (!authResult.ok) {
        return toServiceError<AssignUserPermissionResponse>(
          authResult.error,
          authResult.status,
        );
      }

      const result = await permissionUsecase.assignPermissionToUser(
        Number(params.assignUserPermissionRequest.userId!),
        authResult.data.username || "unknown",
        params.assignUserPermissionRequest.permissionIds!,
      );

      if (!result.ok) {
        return toServiceError<AssignUserPermissionResponse>(result.error);
      }

      return toServiceSuccess({
        message: "Permission assigned",
      } as AssignUserPermissionResponse);
    } catch (e) {
      return toServiceException<AssignUserPermissionResponse>(
        e,
        "Failed to assign permission",
      );
    }
  };

  const permissionServiceGetUserPermissions = async (
    c: Context,
    params: PermissionServiceGetUserPermissionsRequest,
  ): Promise<ServiceResult<GetUserPermissionsResponse>> => {
    try {
      const authResult = await authenticator.mustHaveArrScopes(
        c,
        {
          USER: true,
        },
        PermissionServiceApiOperationScopesMap.permissionServiceGetUserPermissions,
      );

      if (!authResult.ok) {
        return toServiceError<GetUserPermissionsResponse>(
          authResult.error,
          authResult.status,
        );
      }

      const userId = Number(params.userId || params.userId2);
      if (isNaN(userId)) {
        return toServiceError<GetUserPermissionsResponse>(
          {
            code: "INVALID_USER_ID",
            message: "Invalid user ID provided",
          },
          400,
        );
      }

      const result = await permissionUsecase.getUserPermissions(userId);

      if (!result.ok) {
        return toServiceError<GetUserPermissionsResponse>(result.error);
      }

      return toServiceSuccess({
        userPermissions: result.data.map((up) => ({
          id: up.id?.toString(),
          userId: up.userId?.toString(),
          permissionId: up.permissionId,
          createdBy: up.createdBy,
          createdAt: up.createdAt,
          updatedAt: up.updatedAt,
        })),
        meta: {
          message: "User permissions retrieved successfully",
        },
      } as GetUserPermissionsResponse);
    } catch (e) {
      return toServiceException<GetUserPermissionsResponse>(
        e,
        "Failed to get user permissions",
      );
    }
  };

  const permissionServiceRevokePermission = async (
    c: Context,
    params: PermissionServiceRevokePermissionRequest,
  ): Promise<ServiceResult<RevokePermissionResponse>> => {
    try {
      const authResult = await authenticator.mustHaveArrScopes(
        c,
        {
          USER: true,
        },
        PermissionServiceApiOperationScopesMap.permissionServiceRevokePermission,
      );

      if (!authResult.ok) {
        return toServiceError<RevokePermissionResponse>(
          authResult.error,
          authResult.status,
        );
      }

      const result = await permissionUsecase.deleteUserPermissions(
        Number(params.revokePermissionRequest.userId!),
        [params.revokePermissionRequest.permissionId!],
      );

      if (!result.ok) {
        return toServiceError<RevokePermissionResponse>(result.error);
      }

      return toServiceSuccess({
        message: "Permission revoked successfully",
      } as RevokePermissionResponse);
    } catch (e) {
      return toServiceException<RevokePermissionResponse>(
        e,
        "Failed to revoke permission",
      );
    }
  };

  return {
    permissionServiceAssignPermission,
    permissionServiceGetUserPermissions,
    permissionServiceRevokePermission,
  };
};

export default permissionService;
