import { Context } from "hono";
import { toRegisterResponse } from "@/data/schemas/user/transform";
import { Maker } from "@packages/pkg/oauth";
import {
  toServiceError,
  toServiceSuccess,
  toServiceException,
} from "@/utils/helpers/serviceResult";
import {
  IdentityServiceApiImpl,
  RegisterResponse,
  ServiceResult,
} from "@packages/openapigen";
import { IdentityServiceRegisterRequest } from "@packages/openapigen/src/modules/authentication/v1/apis/IdentityServiceApi/client";
import { IdentityUsecase } from "@/usecases/identity";

type Deps = {
  identityUsecase: IdentityUsecase;
  maker: Maker;
};

const identityService = ({
  identityUsecase,
  maker,
}: Deps): IdentityServiceApiImpl => {
  const identityServiceRegister = async (
    c: Context,
    params: IdentityServiceRegisterRequest,
  ): Promise<ServiceResult<RegisterResponse>> => {
    try {
      const result = await identityUsecase.registerUser(params.registerRequest);

      if (!result.ok) {
        return toServiceError<RegisterResponse>(result.error);
      }

      // Create access token
      const { token: accessToken } = await maker.createToken({
        userID: result.data.id.toString(),
        username: result.data.username || "unknown",
        permission: "",
        role: result.data.roleType || ("user" as any),
        duration: 15 * 60 * 1000, // 15 minutes
        instanceID: "default-instance",
        roleID: result.data.roleType || "user",
      });

      // Create refresh token
      const { token: refreshToken } = await maker.createRefreshToken({
        userID: result.data.id.toString(),
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        linkedAccessTokenID: accessToken,
      });

      const response = toRegisterResponse(
        result.data,
        "User registered successfully",
        accessToken,
        refreshToken,
      );

      c.status(201);
      return toServiceSuccess(response);
    } catch (e) {
      return toServiceException<RegisterResponse>(e, "Failed to register user");
    }
  };

  return {
    identityServiceRegister,
  };
};

export default identityService;
