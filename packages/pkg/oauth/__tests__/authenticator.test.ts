import { createAuthenticator } from "../authenticator";
import { createJWTMaker } from "../jwt";
import { Context } from "hono";
import { UserRoleTypeEnum } from "@packages/openapigen";

describe("authenticator.ts", () => {
  const secretKey = "test-secret-key-with-minimum-32-characters-required";
  const maker = createJWTMaker({ secretKey });

  const createMockContext = (
    authHeader?: string,
    cookieHeader?: string,
  ): Context => {
    return {
      req: {
        header: (name: string) => {
          if (name.toLowerCase() === "authorization") {
            return authHeader;
          }
          if (name.toLowerCase() === "cookie") {
            return cookieHeader;
          }
          return undefined;
        },
      },
    } as any;
  };

  describe("AuthenticatorImpl", () => {
    describe("mustHaveScope", () => {
      test("should authorize with valid token and matching permission", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read user:write",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveScope(
          ctx,
          roleMap,
          "user:read",
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-123");
          expect(result.data.username).toBe("testuser");
        }
      });

      test("should return error when token is missing", async () => {
        const authenticator = createAuthenticator({ maker });
        const ctx = createMockContext(); // No auth header
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveScope(ctx, roleMap, "user:read");

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("UNAUTHORIZED");
          expect(result.error.message).toBe("request unauthorized: failed to retrieve token");
          expect(result.status).toBe(401);
        }
      });

      test("should return error when token is invalid", async () => {
        const authenticator = createAuthenticator({ maker });
        const ctx = createMockContext("Bearer invalid-token");
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveScope(ctx, roleMap, "user:read");

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("AUTHENTICATION_ERROR");
          expect(result.status).toBe(500);
        }
      });

      test("should return error when permission is denied", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: false };

        const result = await authenticator.mustHaveScope(ctx, roleMap, "admin:delete");

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("PERMISSION_DENIED");
          expect(result.error.message).toBe("permission denied");
          expect(result.status).toBe(403);
        }
      });

      test("should authorize with token from cookie", async () => {
        const authenticator = createAuthenticator({
          maker,
          accessTokenCookieKey: "access_token",
        });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(undefined, `access_token=${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveScope(
          ctx,
          roleMap,
          "user:read",
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-123");
        }
      });

      test("should authorize when no role map provided", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);

        const result = await authenticator.mustHaveScope(ctx);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-123");
        }
      });
    });

    describe("mustHaveArrScopes", () => {
      test("should authorize with valid token and matching permissions", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read user:write post:create",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveArrScopes(ctx, roleMap, [
          "user:read",
          "user:write",
        ]);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-123");
        }
      });

      test("should return error when token is missing", async () => {
        const authenticator = createAuthenticator({ maker });
        const ctx = createMockContext();
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveArrScopes(ctx, roleMap, ["user:read"]);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("UNAUTHORIZED");
          expect(result.error.message).toBe("request unauthorized: failed to retrieve token");
          expect(result.status).toBe(401);
        }
      });

      test("should throw error when permissions are denied", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: false };

        const result = await authenticator.mustHaveArrScopes(ctx, roleMap, ["admin:delete"]);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("PERMISSION_DENIED");
          expect(result.error.message).toBe("permission denied");
          expect(result.status).toBe(403);
        }
      });

      test("should authorize with empty permissions array", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveArrScopes(ctx, roleMap, []);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-123");
        }
      });

      test("should handle multiple permissions with wildcard", async () => {
        const authenticator = createAuthenticator({ maker });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:* post:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(`Bearer ${token}`);
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveArrScopes(ctx, roleMap, [
          "user:read",
          "user:write",
          "post:read",
        ]);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.permission).toContain("user:*");
        }
      });
    });

    describe("cookie handling", () => {
      test("should extract token from cookie with multiple cookies", async () => {
        const authenticator = createAuthenticator({
          maker,
          accessTokenCookieKey: "my_token",
        });

        const { token } = await maker.createToken({
          userID: "user-123",
          username: "testuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(
          undefined,
          `session_id=abc123; my_token=${token}; theme=dark`,
        );
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveScope(
          ctx,
          roleMap,
          "user:read",
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-123");
        }
      });

      test("should prefer Authorization header over cookie", async () => {
        const authenticator = createAuthenticator({
          maker,
          accessTokenCookieKey: "access_token",
        });

        const { token: headerToken } = await maker.createToken({
          userID: "user-header",
          username: "headeruser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const { token: cookieToken } = await maker.createToken({
          userID: "user-cookie",
          username: "cookieuser",
          permission: "user:read",
          role: UserRoleTypeEnum.User,
          duration: 15 * 60 * 1000,
          instanceID: "instance-1",
          roleID: "role-1",
        });

        const ctx = createMockContext(
          `Bearer ${headerToken}`,
          `access_token=${cookieToken}`,
        );
        const roleMap = { [UserRoleTypeEnum.User]: true };

        const result = await authenticator.mustHaveScope(
          ctx,
          roleMap,
          "user:read",
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.userID).toBe("user-header");
        }
      });
    });
  });
});
