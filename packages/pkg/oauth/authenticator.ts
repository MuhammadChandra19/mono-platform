import { Context } from "hono";
import { Maker, PayloadWithScope } from "./types";
import { UserRoleTypeEnum, ServiceResult } from "@packages/openapigen";

/**
 * Authenticator interface for managing authentication and authorization
 */
export interface Authenticator {
  /**
   * Validates that the request has the required scope/permission
   * @param c - Hono context
   * @param roleMap - Map of allowed roles (if undefined, all roles allowed)
   * @param requiredPermissions - Required permission string (optional)
   * @returns ServiceResult with Payload if authorized or error if unauthorized
   */
  mustHaveScope(
    c: Context,
    roleMap?: Record<UserRoleTypeEnum, boolean>,
    requiredPermissions?: string,
  ): Promise<ServiceResult<PayloadWithScope>>;

  /**
   * Validates that the request has the required scopes from an array
   * @param c - Hono context
   * @param roleMap - Map of allowed roles (if undefined, all roles allowed)
   * @param requiredPermissions - Array of required permissions
   * @returns ServiceResult with Payload if authorized or error if unauthorized
   */
  mustHaveArrScopes(
    c: Context,
    roleMap?: Record<UserRoleTypeEnum, boolean>,
    requiredPermissions?: readonly string[],
  ): Promise<ServiceResult<PayloadWithScope>>;
}

type AuthenticatorDeps = {
  maker: Maker;
  accessTokenCookieKey?: string;
};

/**
 * Extracts auth token from Authorization header or cookie
 * @param c - Hono context
 * @param accessTokenCookieKey - Cookie key for access token
 * @returns Token string or null
 */
const getAuthToken = (
  c: Context,
  accessTokenCookieKey: string,
): string | null => {
  // Try Authorization header first (Bearer token)
  const authHeader = c.req.header("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Try cookie
  const token = getAuthTokenFromCookie(c, accessTokenCookieKey);
  if (token) {
    return token;
  }

  return null;
};

/**
 * Extracts auth token from cookie
 * @param c - Hono context
 * @param accessTokenCookieKey - Cookie key for access token
 * @returns Token string or null
 */
const getAuthTokenFromCookie = (
  c: Context,
  accessTokenCookieKey: string,
): string | null => {
  try {
    const cookieHeader = c.req.header("cookie");
    if (!cookieHeader) {
      return null;
    }

    // Parse cookies
    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        cookies[key] = decodeURIComponent(value);
      }
    });

    return cookies[accessTokenCookieKey] || null;
  } catch {
    return null;
  }
};

/**
 * Factory function to create an authenticator instance
 * @param deps - Dependencies for authenticator
 * @returns Authenticator instance
 */
const createAuthenticator = ({
  maker,
  accessTokenCookieKey = "access_token",
}: AuthenticatorDeps): Authenticator => {
  const mustHaveScope = async (
    c: Context,
    roleMap?: Record<UserRoleTypeEnum, boolean>,
    requiredPermissions?: string,
  ): Promise<ServiceResult<PayloadWithScope>> => {
    try {
      const token = getAuthToken(c, accessTokenCookieKey);
      if (!token) {
        return {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "request unauthorized: failed to retrieve token",
          },
          status: 401,
        };
      }

      const claim = await maker.verifyToken(token);

      if (!claim.hasScope(roleMap, requiredPermissions)) {
        return {
          ok: false,
          error: {
            code: "PERMISSION_DENIED",
            message: "permission denied",
          },
          status: 403,
        };
      }

      return {
        ok: true,
        data: claim,
      };
    } catch (e) {
      return {
        ok: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: e instanceof Error ? e.message : "Authentication failed",
        },
        status: 500,
      };
    }
  };

  const mustHaveArrScopes = async (
    c: Context,
    roleMap?: Record<UserRoleTypeEnum, boolean>,
    requiredPermissions?: string[],
  ): Promise<ServiceResult<PayloadWithScope>> => {
    try {
      const token = getAuthToken(c, accessTokenCookieKey);
      if (!token) {
        return {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "request unauthorized: failed to retrieve token",
          },
          status: 401,
        };
      }

      const claim = await maker.verifyToken(token);

      // Join permissions array into a single string
      const permissions =
        requiredPermissions && requiredPermissions.length > 0
          ? requiredPermissions.join(",")
          : undefined;

      if (!claim.hasScope(roleMap, permissions)) {
        return {
          ok: false,
          error: {
            code: "PERMISSION_DENIED",
            message: "permission denied",
          },
          status: 403,
        };
      }

      return {
        ok: true,
        data: claim,
      };
    } catch (e) {
      return {
        ok: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: e instanceof Error ? e.message : "Authentication failed",
        },
        status: 500,
      };
    }
  };

  return {
    mustHaveScope,
    mustHaveArrScopes,
  };
};

export default createAuthenticator;
export type { AuthenticatorDeps };
export { createAuthenticator };
