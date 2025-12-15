import { NodePgDatabase } from "drizzle-orm/node-postgres";
import userRepository from "./user";
import permissionRepository from "./permission";

type Deps = {
  db: NodePgDatabase;
};
const repositories = ({ db }: Deps) => {
  const user = userRepository({ db });
  const permission = permissionRepository({ db });
  return {
    user,
    permission,
  };
};

type Repository = ReturnType<typeof repositories>;
export default repositories;
export type { Repository };
