import { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Creates a transaction wrapper for PostgreSQL database operations.
 *
 * This function provides a clean way to execute database operations within a transaction,
 * automatically handling commits and rollbacks based on success or failure.
 *
 * @param db - The Drizzle ORM NodePgDatabase instance
 *
 * @returns A function that accepts a callback to execute within a transaction
 *
 * @example
 * ```typescript
 * const db = createPostgresConnection(config);
 * const transaction = createTransactionWrapper(db);
 *
 * // Execute operations in a transaction
 * const result = await transaction(async (tx) => {
 *   await tx.insert(users).values({ name: 'John' });
 *   await tx.insert(posts).values({ title: 'Hello' });
 *   return { success: true };
 * });
 * ```
 */
export const createTransactionWrapper = <
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  db: NodePgDatabase<TSchema>,
) => {
  return async <T>(
    fn: (tx: NodePgDatabase<TSchema>) => Promise<T>,
  ): Promise<T> => {
    return db.transaction(async (tx) => {
      return fn(tx);
    });
  };
};

type TransactionWrapper = ReturnType<typeof createTransactionWrapper>;
export type { TransactionWrapper };
