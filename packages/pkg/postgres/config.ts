export const pgConfig = {
  user: process.env.PG_USER ?? "postgres",
  password: process.env.PG_PASSWORD ?? "password",
  host: process.env.PG_HOST ?? "localhost",
  port: Number(process.env.PG_PORT ?? 5433),
  database: process.env.PG_DATABASE ?? "mono_platform",
};

export type PGConfig = typeof pgConfig;
