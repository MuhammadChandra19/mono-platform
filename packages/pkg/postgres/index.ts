import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { PGConfig } from "./config";

/**
 * Creates a new PostgreSQL database connection using the provided configuration.
 *
 * @param config - The PostgreSQL configuration object containing connection parameters
 * @param config.user - The database user name
 * @param config.password - The database user password
 * @param config.host - The database host address
 * @param config.port - The database port number
 * @param config.database - The name of the database to connect to
 *
 * @returns A Drizzle ORM NodePgDatabase instance configured with the connection pool
 *
 * @example
 * ```typescript
 * const db = createPostgresConnection({
 *   user: 'myuser',
 *   password: 'mypassword',
 *   host: 'localhost',
 *   port: 5433,
 *   database: 'mydb'
 * });
 * ```
 */
const createPostgresConnection = (config: PGConfig): NodePgDatabase => {
  const pool = new Pool({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: config.database,
  });

  return drizzle({ client: pool });
};

export { createPostgresConnection };
export { createTransactionWrapper } from "./transaction";
export type { TransactionWrapper } from "./transaction";
