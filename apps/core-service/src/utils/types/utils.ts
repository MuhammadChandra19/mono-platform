export type WithoutTimestamps<T> = Omit<T, "createdAt" | "updatedAt">;
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type LiteralUnion<T extends U, U = string> = T | (U & {});
