import { RegisterRequest, User, RegisterResponse } from "@packages/openapigen";
import { NewUser, UserSchema } from "./entity";
import { Result, err, ok, createError, ErrorCode } from "@/utils/types/result";
import { hashPassword } from "@/utils/helpers/password";

export const fromRegisterRequest = async (
  request: RegisterRequest,
): Promise<Result<NewUser>> => {
  if (!request.fullname) {
    return err(
      createError(ErrorCode.RequiredField, "Fullname is required", {
        field: "fullname",
      }),
    );
  }
  if (!request.password) {
    return err(
      createError(ErrorCode.RequiredField, "Password is required", {
        field: "password",
      }),
    );
  }
  if (!request.username) {
    return err(
      createError(ErrorCode.RequiredField, "Username is required", {
        field: "username",
      }),
    );
  }
  if (!request.email) {
    return err(
      createError(ErrorCode.RequiredField, "Email is required", {
        field: "email",
      }),
    );
  }
  if (!request.phoneNumber) {
    return err(
      createError(ErrorCode.RequiredField, "Phone number is required", {
        field: "phoneNumber",
      }),
    );
  }

  const hashedPassword = await hashPassword(request.password);

  return ok({
    fullname: request.fullname,
    username: request.username,
    phoneNumber: request.phoneNumber,
    email: request.email,
    password: hashedPassword,
  });
};

export const toUser = (entity: UserSchema): User => {
  return {
    id: entity.id?.toString(),
    fullname: entity.fullname,
    username: entity.username ?? undefined,
    phoneNumber: entity.phoneNumber ?? undefined,
    email: entity.email ?? undefined,
    profilePic: entity.profilePic ?? undefined,
    address: entity.address ?? undefined,
    gender: entity.gender ?? undefined,
    dateOfBirth: entity.dateOfBirth ?? undefined,
    placeOfBirth: entity.placeOfBirth ?? undefined,
    roleType: entity.roleType ?? undefined,
    status: entity.status ?? undefined,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

export const toRegisterResponse = (
  entity: UserSchema,
  message?: string,
  token?: string,
  refreshToken?: string,
): RegisterResponse => {
  return {
    message,
    user: toUser(entity),
    token,
    refreshToken,
  };
};
