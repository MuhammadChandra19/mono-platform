import { Maker } from "@packages/pkg/oauth";
import { Usecase } from "@/usecases";
import identityService from "./identity";

type Deps = {
  usecases: Usecase;
  authMaker: Maker;
};

const services = ({ usecases, authMaker }: Deps) => {
  const identity = identityService({
    identityUsecase: usecases.identity,
    maker: authMaker,
  });

  return {
    identity,
  };
};
type Service = ReturnType<typeof services>;
export default services;
export type { Service };
