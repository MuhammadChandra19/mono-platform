import {
  DatabaseError,
  DatabaseErrorCode,
  DatabaseErrorMapping,
} from "@/utils/types/database";

/**
 * Maps a raw database error to a standardized `DatabaseError`.
 * @param error - The raw database error object.
 * @returns A `DatabaseError` object with a code, message, and optional details.
 */
export const mapDatabaseError = (error: unknown): DatabaseError => {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as any).code) as DatabaseErrorCode;
    return {
      code,
      message: DatabaseErrorMapping[code] || "Unknown database error",
      details: (error as any).details,
    };
  }

  return {
    code: "UNKNOWN_ERROR" as DatabaseErrorCode,
    message: "An unknown error occurred",
  };
};
