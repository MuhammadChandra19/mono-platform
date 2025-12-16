import { IdentityUsecase } from "@/usecases/identity";
import { PermissionUsecase } from "@/usecases/permission";
import { comparePassword } from "@/utils/helpers/password";
import {
  toServiceError,
  toServiceException,
  toServiceSuccess,
} from "@/utils/helpers/serviceResult";
import {
  AuthServiceApiImpl,
  LoginResponse,
  ServiceResult,
} from "@packages/openapigen/src";
import { AuthServiceLoginRequest } from "@packages/openapigen/src/modules/authentication/v1/apis/AuthServiceApi/client";
import { Authenticator, Maker } from "@packages/pkg/oauth";
import { Context } from "hono";

type Deps = {
  identityUsecase: IdentityUsecase;
  permissionUsecase: PermissionUsecase;
  authenticator: Authenticator;
  maker: Maker;
};

const authService = ({
  identityUsecase,
  permissionUsecase,
  maker,
}: Deps): AuthServiceApiImpl => {
  const authServiceLogin = async (
    c: Context,
    params: AuthServiceLoginRequest,
  ): Promise<ServiceResult<LoginResponse>> => {
    try {
      const result = await identityUsecase.getUserByEmail(
        params.loginRequest.email!,
      );
      if (!result.ok) {
        return toServiceError<LoginResponse>(result.error);
      }

      const matchPassword = await comparePassword(
        params.loginRequest.password!,
        result.data.password!,
      );

      if (!matchPassword) {
        return toServiceError<LoginResponse>({
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        });
      }

      const rolesAndPermissionsResult =
        await permissionUsecase.getUserPermissions(result.data.id);
      if (!rolesAndPermissionsResult.ok) {
        return toServiceError<LoginResponse>(rolesAndPermissionsResult.error);
      }

      const stringPermission = rolesAndPermissionsResult.data
        .map((perm) => perm.permissionId)
        .join(",");

      const { token: accessToken } = await maker.createToken({
        userID: result.data.id.toString(),
        username: result.data.username || "unknown",
        permission: stringPermission,
        role: result.data.roleType || ("user" as any),
        duration: 15 * 60 * 1000, // 15 minutes
        instanceID: "default-instance",
        roleID: result.data.roleType || "user",
      });

      const { token: refreshToken } = await maker.createRefreshToken({
        userID: result.data.id.toString(),
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        linkedAccessTokenID: accessToken,
      });

      c.set(
        "set-cookie",
        `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
      );
      c.set(
        "set-cookie",
        `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}`,
      );
      return toServiceSuccess<LoginResponse>({
        message: "Login successful",
        loginEntity: {
          refreshToken,
          sessionToken: accessToken,
        },
      });
    } catch (error) {
      return toServiceException<LoginResponse>(error);
    }
  };
  return {
    authServiceLogin,
  };
};
type AuthService = ReturnType<typeof authService>;
export default authService;
export type { AuthService };
