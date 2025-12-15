import { ServiceResult } from "@packages/openapigen";
import { AppError } from "@/utils/types/result";
import type { StatusCode } from "hono/utils/http-status";

/**
 * Maps an AppError to a ServiceResult error response
 * @param error - Application error
 * @param defaultStatus - Default HTTP status code (default: 400)
 * @returns ServiceResult error response
 */
export const toServiceError = <T>(
  error: AppError,
  defaultStatus: StatusCode = 400,
): ServiceResult<T> => {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    status: defaultStatus,
  };
};

/**
 * Maps data to a ServiceResult success response
 * @param data - Response data
 * @returns ServiceResult success response
 */
export const toServiceSuccess = <T>(data: T): ServiceResult<T> => {
  return {
    ok: true,
    data,
  };
};

/**
 * Maps a caught exception to a ServiceResult error response
 * @param e - Caught exception
 * @param defaultMessage - Default error message
 * @param defaultStatus - Default HTTP status code (default: 500)
 * @returns ServiceResult error response
 */
export const toServiceException = <T>(
  e: unknown,
  defaultMessage: string = "An unexpected error occurred",
  defaultStatus: StatusCode = 500,
): ServiceResult<T> => {
  if (e instanceof Error) {
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: e.message || defaultMessage,
      },
      status: defaultStatus,
    };
  }

  return {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: defaultMessage,
    },
    status: defaultStatus,
  };
};
