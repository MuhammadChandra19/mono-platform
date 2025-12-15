import { Authenticator, Maker } from "@packages/pkg/oauth";
import { Usecase } from "@/usecases";
import identityService from "./identity";
import permissionService from "./permission";
import authService from "./auth";

type Deps = {
  usecases: Usecase;
  authMaker: Maker;
  authenticator: Authenticator;
};

const services = ({ usecases, authMaker, authenticator }: Deps) => {
  const identity = identityService({
    identityUsecase: usecases.identity,
    maker: authMaker,
  });

  const permission = permissionService({
    permissionUsecase: usecases.permission,
    authenticator: authenticator,
  });

  const auth = authService({
    identityUsecase: usecases.identity,
    permissionUsecase: usecases.permission,
    maker: authMaker,
    authenticator: authenticator,
  });

  return {
    identity,
    permission,
    auth,
  };
};
type Service = ReturnType<typeof services>;
export default services;
export type { Service };
