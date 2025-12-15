import { PayloadWithScope } from "../types";
import { UserRoleTypeEnum } from "@packages/openapigen";

describe("PayloadWithScope", () => {
  const createTestPayload = (): PayloadWithScope => {
    return new PayloadWithScope({
      id: "test-id",
      userID: "user-123",
      username: "testuser",
      permission: "user:read user:write admin:delete",
      role: UserRoleTypeEnum.User,
      instanceID: "instance-1",
      roleID: "role-1",
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
  };

  describe("isValid", () => {
    test("should return true for non-expired token", () => {
      const payload = createTestPayload();
      expect(payload.isValid()).toBe(true);
    });

    test("should return false for expired token", () => {
      const payload = new PayloadWithScope({
        ...createTestPayload(),
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      expect(payload.isValid()).toBe(false);
    });
  });

  describe("hasScope", () => {
    test("should return true when no role map provided", () => {
      const payload = createTestPayload();
      expect(payload.hasScope()).toBe(true);
      expect(payload.hasScope(undefined, "user:read")).toBe(true);
    });

    test("should return true for exact permission match", () => {
      const payload = createTestPayload();
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "user:read")).toBe(true);
      expect(payload.hasScope(roleMap, "user:write")).toBe(true);
      expect(payload.hasScope(roleMap, "admin:delete")).toBe(true);
    });

    test("should return false for missing permission when role not in map", () => {
      const payload = createTestPayload();
      const roleMap = { [UserRoleTypeEnum.User]: false };

      expect(payload.hasScope(roleMap, "post:create")).toBe(false);
    });

    test("should return true for missing permission when role is in map", () => {
      const payload = createTestPayload();
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "post:create")).toBe(true);
    });

    test("should handle multiple required permissions (comma-separated)", () => {
      const payload = createTestPayload();
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "user:read,user:write")).toBe(true);
      expect(payload.hasScope(roleMap, "user:read,post:create")).toBe(true); // role allows fallback
    });

    test("should handle multiple required permissions (space-separated)", () => {
      const payload = createTestPayload();
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "user:read user:write")).toBe(true);
    });

    test("should handle wildcard permissions with resource:*", () => {
      const payload = new PayloadWithScope({
        ...createTestPayload(),
        permission: "user:* post:read",
      });
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "user:read")).toBe(true);
      expect(payload.hasScope(roleMap, "user:write")).toBe(true);
      expect(payload.hasScope(roleMap, "user:delete")).toBe(true);
      expect(payload.hasScope(roleMap, "post:read")).toBe(true);
      expect(payload.hasScope(roleMap, "post:write")).toBe(true); // role allows fallback
    });

    test("should handle wildcard permission *:*", () => {
      const payload = new PayloadWithScope({
        ...createTestPayload(),
        permission: "*:*",
      });
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "user:read")).toBe(true);
      expect(payload.hasScope(roleMap, "post:write")).toBe(true);
      expect(payload.hasScope(roleMap, "admin:delete")).toBe(true);
      expect(payload.hasScope(roleMap, "anything:anything")).toBe(true);
    });

    test("should return false when required permission not found and role not allowed", () => {
      const payload = createTestPayload();
      const roleMap = { [UserRoleTypeEnum.User]: false };

      expect(payload.hasScope(roleMap, "post:create")).toBe(false);
    });

    test("should handle empty permission strings", () => {
      const payload = new PayloadWithScope({
        ...createTestPayload(),
        permission: "user:read  user:write", // double space
      });
      const roleMap = { [UserRoleTypeEnum.User]: true };

      expect(payload.hasScope(roleMap, "user:read,user:write")).toBe(true);
    });

    test("should return role map value when no required permissions", () => {
      const payload = createTestPayload();

      const allowedRoleMap = { [UserRoleTypeEnum.User]: true };
      expect(payload.hasScope(allowedRoleMap)).toBe(true);

      const deniedRoleMap = { [UserRoleTypeEnum.User]: false };
      expect(payload.hasScope(deniedRoleMap)).toBe(false);
    });

    test("should handle complex permission scenarios", () => {
      const payload = new PayloadWithScope({
        ...createTestPayload(),
        permission: "user:read,user:write post:* admin:delete",
      });
      const roleMap = { [UserRoleTypeEnum.User]: true };

      // Exact matches
      expect(payload.hasScope(roleMap, "user:read")).toBe(true);
      expect(payload.hasScope(roleMap, "admin:delete")).toBe(true);

      // Wildcard matches
      expect(payload.hasScope(roleMap, "post:create")).toBe(true);
      expect(payload.hasScope(roleMap, "post:delete")).toBe(true);

      // Multiple requirements
      expect(
        payload.hasScope(roleMap, "user:read post:create admin:delete"),
      ).toBe(true);

      // Missing permission with role fallback
      expect(payload.hasScope(roleMap, "comment:create")).toBe(true);
    });
  });
});
