import { oauthConfig } from "@packages/pkg/oauth/config";
import { pgConfig } from "@packages/pkg/postgres/config";
import "dotenv/config";

const appConfig = {
  database: pgConfig,
  oatuh: oauthConfig,
} as const;

type AppConfig = typeof appConfig;
export default appConfig;
export type { AppConfig };
