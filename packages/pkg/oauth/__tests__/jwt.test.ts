import { createJWTMaker } from "../jwt";
import { UserRoleTypeEnum } from "@packages/openapigen";

describe("jwt.ts", () => {
  const secretKey = "test-secret-key-with-minimum-32-characters-required";
  const userID = "123";
  const username = "testuser";
  const permission = "read:write";
  const role = UserRoleTypeEnum.User;
  const instanceID = "instance-1";
  const roleID = "role-1";
  const duration = 15 * 60 * 1000; // 15 minutes

  describe("createJWTMaker", () => {
    test("should create instance with valid secret key", () => {
      expect(() => createJWTMaker({ secretKey })).not.toThrow();
    });

    test("should throw error with short secret key", () => {
      expect(() => createJWTMaker({ secretKey: "short" })).toThrow(
        "Secret key must be at least 32 characters long",
      );
    });

    test("should throw error with empty secret key", () => {
      expect(() => createJWTMaker({ secretKey: "" })).toThrow(
        "Secret key must be at least 32 characters long",
      );
    });
  });

  describe("createToken", () => {
    test("should create a valid access token", async () => {
      const maker = createJWTMaker({ secretKey });

      const result = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
      });

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.payload).toBeDefined();
      expect(result.payload.userID).toBe(userID);
      expect(result.payload.username).toBe(username);
      expect(result.payload.permission).toBe(permission);
      expect(result.payload.role).toBe(role);
      expect(result.payload.instanceID).toBe(instanceID);
      expect(result.payload.roleID).toBe(roleID);
      expect(result.payload.id).toBeDefined();
      expect(result.payload.issuedAt).toBeInstanceOf(Date);
      expect(result.payload.expiresAt).toBeInstanceOf(Date);
    });

    test("should create token with user object and metadata", async () => {
      const maker = createJWTMaker({ secretKey });
      const user = { email: "test@example.com", name: "Test User" };
      const metadata = { ip: "127.0.0.1" };

      const result = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
        user,
        metadata,
      });

      expect(result.payload.user).toEqual(user);
      expect(result.payload.metadata).toEqual(metadata);
    });

    test("should create token with correct expiration", async () => {
      const maker = createJWTMaker({ secretKey });
      const beforeCreation = new Date();

      const result = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
      });

      const expectedExpiration = new Date(beforeCreation.getTime() + duration);
      const timeDiff = Math.abs(
        result.payload.expiresAt.getTime() - expectedExpiration.getTime(),
      );

      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe("verifyToken", () => {
    test("should verify a valid token", async () => {
      const maker = createJWTMaker({ secretKey });

      const { token, payload: originalPayload } = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
      });

      const verifiedPayload = await maker.verifyToken(token);

      expect(verifiedPayload.id).toBe(originalPayload.id);
      expect(verifiedPayload.userID).toBe(originalPayload.userID);
      expect(verifiedPayload.username).toBe(originalPayload.username);
      expect(verifiedPayload.permission).toBe(originalPayload.permission);
      expect(verifiedPayload.role).toBe(originalPayload.role);
    });

    test("should throw error for invalid token", async () => {
      const maker = createJWTMaker({ secretKey });

      await expect(maker.verifyToken("invalid-token")).rejects.toThrow(
        "Token verification failed",
      );
    });

    test("should throw error for token signed with different key", async () => {
      const maker1 = createJWTMaker({ secretKey });
      const maker2 = createJWTMaker({
        secretKey: "different-secret-key-with-minimum-32-chars",
      });

      const { token } = await maker1.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
      });

      await expect(maker2.verifyToken(token)).rejects.toThrow(
        "Token verification failed",
      );
    });

    test("should throw error for expired token", async () => {
      const maker = createJWTMaker({ secretKey });
      const shortDuration = 1; // 1 millisecond

      const { token } = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration: shortDuration,
        instanceID,
        roleID,
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(maker.verifyToken(token)).rejects.toThrow(
        "Token verification failed: jwt expired",
      );
    });
  });

  describe("createRefreshToken", () => {
    test("should create a valid refresh token", async () => {
      const maker = createJWTMaker({ secretKey });
      const linkedAccessTokenID = "access-token-id-123";

      const result = await maker.createRefreshToken({
        userID,
        duration,
        linkedAccessTokenID,
      });

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.payload).toBeDefined();
      expect(result.payload.userID).toBe(userID);
      expect(result.payload.linkedAccessTokenID).toBe(linkedAccessTokenID);
      expect(result.payload.id).toBeDefined();
      expect(result.payload.issuedAt).toBeInstanceOf(Date);
      expect(result.payload.expiresAt).toBeInstanceOf(Date);
    });

    test("should create refresh token with correct expiration", async () => {
      const maker = createJWTMaker({ secretKey });
      const linkedAccessTokenID = "access-token-id-123";
      const beforeCreation = new Date();

      const result = await maker.createRefreshToken({
        userID,
        duration,
        linkedAccessTokenID,
      });

      const expectedExpiration = new Date(beforeCreation.getTime() + duration);
      const timeDiff = Math.abs(
        result.payload.expiresAt.getTime() - expectedExpiration.getTime(),
      );

      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe("verifyRefreshToken", () => {
    test("should verify a valid refresh token", async () => {
      const maker = createJWTMaker({ secretKey });
      const linkedAccessTokenID = "access-token-id-123";

      const { token, payload: originalPayload } =
        await maker.createRefreshToken({
          userID,
          duration,
          linkedAccessTokenID,
        });

      const verifiedPayload = await maker.verifyRefreshToken(token);

      expect(verifiedPayload.id).toBe(originalPayload.id);
      expect(verifiedPayload.userID).toBe(originalPayload.userID);
      expect(verifiedPayload.linkedAccessTokenID).toBe(
        originalPayload.linkedAccessTokenID,
      );
    });

    test("should throw error for invalid refresh token", async () => {
      const maker = createJWTMaker({ secretKey });

      await expect(maker.verifyRefreshToken("invalid-token")).rejects.toThrow(
        "Refresh token verification failed",
      );
    });

    test("should throw error when verifying access token as refresh token", async () => {
      const maker = createJWTMaker({ secretKey });

      const { token } = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
      });

      await expect(maker.verifyRefreshToken(token)).rejects.toThrow(
        "Invalid refresh token structure",
      );
    });

    test("should throw error for expired refresh token", async () => {
      const maker = createJWTMaker({ secretKey });
      const linkedAccessTokenID = "access-token-id-123";
      const shortDuration = 1; // 1 millisecond

      const { token } = await maker.createRefreshToken({
        userID,
        duration: shortDuration,
        linkedAccessTokenID,
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(maker.verifyRefreshToken(token)).rejects.toThrow(
        "Refresh token verification failed: jwt expired",
      );
    });
  });

  describe("integration", () => {
    test("should create and verify complete token flow", async () => {
      const maker = createJWTMaker({ secretKey });

      // Create access token
      const accessResult = await maker.createToken({
        userID,
        username,
        permission,
        role,
        duration,
        instanceID,
        roleID,
      });

      // Create refresh token linked to access token
      const refreshResult = await maker.createRefreshToken({
        userID,
        duration: duration * 2, // Refresh token lasts longer
        linkedAccessTokenID: accessResult.payload.id,
      });

      // Verify both tokens
      const verifiedAccess = await maker.verifyToken(accessResult.token);
      const verifiedRefresh = await maker.verifyRefreshToken(
        refreshResult.token,
      );

      expect(verifiedAccess.id).toBe(accessResult.payload.id);
      expect(verifiedRefresh.linkedAccessTokenID).toBe(accessResult.payload.id);
      expect(verifiedRefresh.userID).toBe(verifiedAccess.userID);
    });
  });
});
