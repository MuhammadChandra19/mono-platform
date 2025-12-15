import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/data/schemas/**/entity.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST || "localhost",
    port: Number(process.env.PG_PORT) || 5433,
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "password",
    database: process.env.PG_DATABASE || "mono_platform",
    ssl: false,
  },
} satisfies Config;
