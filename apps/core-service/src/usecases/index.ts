import { Repository } from "@/data/repositories";
import identityUsecase from "./identity";
import permissionUsecase from "./permission";
import { TransactionWrapper } from "@packages/pkg/postgres";

type Deps = {
  repositories: Repository;
  transactionWrapper: TransactionWrapper;
};
const usecases = ({ repositories, transactionWrapper }: Deps) => {
  const identity = identityUsecase({ userRepo: repositories.user });
  const permission = permissionUsecase({
    permissionRepo: repositories.permission,
    txWrapper: transactionWrapper,
  });
  return {
    identity,
    permission,
  };
};

type Usecase = ReturnType<typeof usecases>;
export default usecases;
export type { Usecase };
