import {
  toServiceError,
  toServiceSuccess,
  toServiceException,
} from "../serviceResult";
import { AppError } from "@/utils/types/result";

describe("serviceResult helpers", () => {
  describe("toServiceError", () => {
    test("should map AppError to ServiceResult with default status", () => {
      const error: AppError = {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: { field: "email" },
      };

      const result = toServiceError(error);

      expect(result).toEqual({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: { field: "email" },
        },
        status: 400,
      });
    });

    test("should map AppError to ServiceResult with custom status", () => {
      const error: AppError = {
        code: "NOT_FOUND",
        message: "User not found",
      };

      const result = toServiceError(error, 404);

      expect(result).toEqual({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
        status: 404,
      });
    });

    test("should handle AppError without details", () => {
      const error: AppError = {
        code: "UNAUTHORIZED",
        message: "Access denied",
      };

      const result = toServiceError(error, 401);

      expect(result).toEqual({
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Access denied",
        },
        status: 401,
      });
    });
  });

  describe("toServiceSuccess", () => {
    test("should map data to ServiceResult success", () => {
      const data = {
        id: "123",
        name: "John Doe",
      };

      const result = toServiceSuccess(data);

      expect(result).toEqual({
        ok: true,
        data: {
          id: "123",
          name: "John Doe",
        },
      });
    });

    test("should handle null data", () => {
      const result = toServiceSuccess(null);

      expect(result).toEqual({
        ok: true,
        data: null,
      });
    });

    test("should handle array data", () => {
      const data = [1, 2, 3];
      const result = toServiceSuccess(data);

      expect(result).toEqual({
        ok: true,
        data: [1, 2, 3],
      });
    });
  });

  describe("toServiceException", () => {
    test("should map Error to ServiceResult with default values", () => {
      const error = new Error("Something went wrong");
      const result = toServiceException(error);

      expect(result).toEqual({
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong",
        },
        status: 500,
      });
    });

    test("should map Error to ServiceResult with custom message and status", () => {
      const error = new Error("Database connection failed");
      const result = toServiceException(error, "Database error", 503);

      expect(result).toEqual({
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Database connection failed",
        },
        status: 503,
      });
    });

    test("should handle non-Error exceptions with default message", () => {
      const result = toServiceException("string error");

      expect(result).toEqual({
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
        status: 500,
      });
    });

    test("should handle non-Error exceptions with custom message", () => {
      const result = toServiceException(
        { unexpected: "error" },
        "Custom error message",
        500,
      );

      expect(result).toEqual({
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Custom error message",
        },
        status: 500,
      });
    });

    test("should handle Error with empty message", () => {
      const error = new Error("");
      const result = toServiceException(error, "Fallback message");

      expect(result).toEqual({
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Fallback message",
        },
        status: 500,
      });
    });
  });
});
