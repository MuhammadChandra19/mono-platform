import type { UserRepository } from "@/data/repositories/user";
import type { RegisterRequest } from "@packages/openapigen";
import { fromRegisterRequest } from "@/data/schemas/user/transform";
import { Result, err, ok } from "@/utils/types/result";
import type { NewUser, UserSchema } from "@/data/schemas/user/entity";
import type { UserListParams } from "@/data/schemas/user/types";
import type { CursorPaginatedResult } from "@/utils/types/pagination";

type Deps = {
  userRepo: UserRepository;
};
const identityUsecase = ({ userRepo }: Deps) => {
  const registerUser = async (
    data: RegisterRequest,
  ): Promise<Result<UserSchema>> => {
    const transformResult = await fromRegisterRequest(data);
    if (!transformResult.ok) {
      return err(transformResult.error);
    }

    const createResult = await userRepo.create(transformResult.data);

    if (!createResult.ok) {
      return err({
        code: createResult.error.code,
        message: createResult.error.message,
        details: createResult.error.details,
      });
    }

    return ok(createResult.data);
  };

  const getUserByID = async (id: number): Promise<Result<UserSchema>> => {
    const result = await userRepo.get(id);
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  const updateUser = async (
    id: number,
    data: Partial<NewUser>,
  ): Promise<Result<UserSchema>> => {
    const result = await userRepo.update(id, data);
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  const deleteUser = async (id: number): Promise<Result<NewUser>> => {
    const result = await userRepo.remove(id);
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  const listUsers = async (
    params?: UserListParams,
  ): Promise<Result<CursorPaginatedResult<UserSchema>>> => {
    const result = await userRepo.list(params);
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  const getUserByEmail = async (email: string): Promise<Result<UserSchema>> => {
    const result = await userRepo.getByEmail(email);
    if (!result.ok) {
      return err({
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    return ok(result.data);
  };

  return {
    registerUser,
    getUserByID,
    getUserByEmail,
    updateUser,
    deleteUser,
    listUsers,
  };
};
type IdentityUsecase = ReturnType<typeof identityUsecase>;
export default identityUsecase;
export type { IdentityUsecase };
