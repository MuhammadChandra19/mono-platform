/**
 * Unified return type for database operations
 * @template T - The type of the successful result
 */
export type DatabaseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DatabaseError };

/**
 * Specific error type for database operations
 */
export interface DatabaseError {
  code: DatabaseErrorCode; // Error code specific to the database
  message: string; // Human-readable error message
  details?: Record<string, any>; // Additional error details
}

/**
 * Enum for common database error codes
 */
export enum DatabaseErrorCode {
  UniqueViolation = "23505",
  ForeignKeyViolation = "23503",
  NotNullViolation = "23502",
  CheckViolation = "23514",
  ExclusionViolation = "23P01",

  InvalidTextRepresentation = "22P02",
  NumericValueOutOfRange = "22003",

  UndefinedTable = "42P01",
  UndefinedColumn = "42703",
  UndefinedFunction = "42883",
  DatatypeMismatch = "42804",

  StringTruncation = "22001",

  InsufficientPrivilege = "42501",

  DeadlockDetected = "40P01",
  SerializationFailure = "40001",

  // Logical (non-SQL) errors you should define
  NotFound = "NOT_FOUND",
  NoData = "NO_DATA",
  InvalidPayload = "INVALID_PAYLOAD",
}

/**
 * Mapping of common database error codes to human-readable messages
 */
export const DatabaseErrorMapping: Record<DatabaseErrorCode, string> = {
  [DatabaseErrorCode.UniqueViolation]: "Unique constraint violation",
  [DatabaseErrorCode.ForeignKeyViolation]: "Foreign key constraint violation",
  [DatabaseErrorCode.NotNullViolation]: "Not null constraint violation",
  [DatabaseErrorCode.CheckViolation]: "Check constraint violation",
  [DatabaseErrorCode.ExclusionViolation]: "Exclusion constraint violation",

  [DatabaseErrorCode.InvalidTextRepresentation]: "Invalid text representation",
  [DatabaseErrorCode.NumericValueOutOfRange]: "Numeric value out of range",

  [DatabaseErrorCode.UndefinedTable]: "Undefined table",
  [DatabaseErrorCode.UndefinedColumn]: "Undefined column",
  [DatabaseErrorCode.UndefinedFunction]: "Undefined function",
  [DatabaseErrorCode.DatatypeMismatch]: "Data type mismatch",

  [DatabaseErrorCode.StringTruncation]: "String data right truncation",

  [DatabaseErrorCode.InsufficientPrivilege]: "Insufficient privilege",

  [DatabaseErrorCode.DeadlockDetected]: "Deadlock detected",
  [DatabaseErrorCode.SerializationFailure]: "Serialization failure",

  [DatabaseErrorCode.NotFound]: "Resource not found",
  [DatabaseErrorCode.NoData]: "No data returned",
  [DatabaseErrorCode.InvalidPayload]: "Invalid payload provided",
};
