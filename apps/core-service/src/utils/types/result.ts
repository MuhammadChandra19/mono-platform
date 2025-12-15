/**
 * Unified return type for operations that can succeed or fail
 * @template T - The type of the successful result
 * @template E - The type of the error (defaults to AppError)
 */
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/**
 * Generic application error type
 */
export interface AppError {
  code: string; // Error code for programmatic handling
  message: string; // Human-readable error message
  details?: Record<string, any>; // Additional error context
}

/**
 * Common error codes used across the application
 */
export enum ErrorCode {
  // Validation errors
  ValidationError = "VALIDATION_ERROR",
  RequiredField = "REQUIRED_FIELD",
  InvalidFormat = "INVALID_FORMAT",

  // Business logic errors
  NotFound = "NOT_FOUND",
  AlreadyExists = "ALREADY_EXISTS",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",

  // System errors
  InternalError = "INTERNAL_ERROR",
  ExternalServiceError = "EXTERNAL_SERVICE_ERROR",

  // Operation errors
  OperationFailed = "OPERATION_FAILED",
  InvalidOperation = "INVALID_OPERATION",
}

/**
 * Helper function to create a success result
 */
export const ok = <T>(data: T): Result<T, never> => ({
  ok: true,
  data,
});

/**
 * Helper function to create an error result
 */
export const err = <E = AppError>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Helper function to create an AppError
 */
export const createError = (
  code: string,
  message: string,
  details?: Record<string, any>,
): AppError => ({
  code,
  message,
  details,
});
