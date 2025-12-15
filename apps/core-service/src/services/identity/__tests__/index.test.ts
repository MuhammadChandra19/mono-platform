import identityService from "../index";
import { Maker } from "@packages/pkg/oauth";
import { Context } from "hono";
import { UserSchema } from "@/data/schemas/user/entity";
import {
  UserRoleTypeEnum,
  UserStatusEnum,
  UserGenderEnum,
} from "@packages/openapigen";
import { createMockIdentityUsecase } from "@/usecases/__mocks__/identity";

describe("identityService", () => {
  const mockUserSchema: UserSchema = {
    id: 1,
    fullname: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    gender: UserGenderEnum.Female,

    dateOfBirth: new Date("1990-01-01"),
    address: null,
    roleType: UserRoleTypeEnum.User,
    status: UserStatusEnum.UserStatusActive,
    createdAt: new Date(),
    updatedAt: new Date(),
    profilePic: null,
    placeOfBirth: null,
    password: "hashed-password",
  };

  const mockMaker: Maker = {
    createToken: jest.fn().mockResolvedValue({
      token: "mock-access-token",
      payload: {
        id: "token-id",
        userID: "1",
        username: "johndoe",
        permission: "user:read user:write",
        role: UserRoleTypeEnum.User,
        instanceID: "default-instance",
        roleID: UserRoleTypeEnum.User,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    }),
    verifyToken: jest.fn(),
    createRefreshToken: jest.fn().mockResolvedValue({
      token: "mock-refresh-token",
      payload: {
        id: "refresh-token-id",
        userID: "1",
        linkedAccessTokenID: "mock-access-token",
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    verifyRefreshToken: jest.fn(),
  };

  const mockContext = {
    status: jest.fn(),
    req: {
      header: jest.fn(),
    },
  } as unknown as Context;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("identityServiceRegister", () => {
    test("should register user successfully and return tokens", async () => {
      const mockIdentityUsecase = createMockIdentityUsecase();
      (mockIdentityUsecase.registerUser as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockUserSchema,
      });

      const service = identityService({
        identityUsecase: mockIdentityUsecase,
        maker: mockMaker,
      });

      const result = await service.identityServiceRegister(mockContext, {
        registerRequest: {
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!",
          phoneNumber: "+1234567890",
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.message).toBe("User registered successfully");
        expect(result.data.user).toBeDefined();
        expect(result.data.user?.id).toBe("1");
        expect(result.data.token).toBe("mock-access-token");
        expect(result.data.refreshToken).toBe("mock-refresh-token");
      }
      expect(mockContext.status).toHaveBeenCalledWith(201);
      expect(mockMaker.createToken).toHaveBeenCalledWith({
        userID: "1",
        username: "johndoe",
        permission: "",
        role: UserRoleTypeEnum.User,
        duration: 15 * 60 * 1000,
        instanceID: "default-instance",
        roleID: UserRoleTypeEnum.User,
      });
      expect(mockMaker.createRefreshToken).toHaveBeenCalledWith({
        userID: "1",
        duration: 7 * 24 * 60 * 60 * 1000,
        linkedAccessTokenID: "mock-access-token",
      });
    });

    test("should handle registration failure from usecase", async () => {
      const mockIdentityUsecase = createMockIdentityUsecase();
      (mockIdentityUsecase.registerUser as jest.Mock).mockResolvedValue({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Username already exists",
          details: { field: "username" },
        },
      });

      const service = identityService({
        identityUsecase: mockIdentityUsecase,
        maker: mockMaker,
      });

      const result = await service.identityServiceRegister(mockContext, {
        registerRequest: {
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!",
          phoneNumber: "+1234567890",
        },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.message).toBe("Username already exists");
        expect(result.status).toBe(400);
      }
      expect(mockContext.status).not.toHaveBeenCalled();
      expect(mockMaker.createToken).not.toHaveBeenCalled();
    });

    test("should handle null username from registration", async () => {
      const userSchemaWithNullUsername: UserSchema = {
        ...mockUserSchema,
        username: null,
      };

      const mockIdentityUsecase = createMockIdentityUsecase();
      (mockIdentityUsecase.registerUser as jest.Mock).mockResolvedValue({
        ok: true,
        data: userSchemaWithNullUsername,
      });

      const service = identityService({
        identityUsecase: mockIdentityUsecase,
        maker: mockMaker,
      });

      const result = await service.identityServiceRegister(mockContext, {
        registerRequest: {
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!",
          phoneNumber: "+1234567890",
        },
      });

      expect(result.ok).toBe(true);
      expect(mockMaker.createToken).toHaveBeenCalledWith({
        userID: "1",
        username: "unknown", // Should use fallback for null username
        permission: "",
        role: UserRoleTypeEnum.User,
        duration: 15 * 60 * 1000,
        instanceID: "default-instance",
        roleID: UserRoleTypeEnum.User,
      });
    });

    test("should handle token creation exception", async () => {
      const mockIdentityUsecase = createMockIdentityUsecase();
      (mockIdentityUsecase.registerUser as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockUserSchema,
      });

      const failingMaker: Maker = {
        ...mockMaker,
        createToken: jest
          .fn()
          .mockRejectedValue(new Error("Token creation failed")),
      };

      const service = identityService({
        identityUsecase: mockIdentityUsecase,
        maker: failingMaker,
      });

      const result = await service.identityServiceRegister(mockContext, {
        registerRequest: {
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!",
          phoneNumber: "+1234567890",
        },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INTERNAL_ERROR");
        expect(result.error.message).toBe("Token creation failed");
        expect(result.status).toBe(500);
      }
    });

    test("should handle null roleType from registration", async () => {
      const userSchemaWithNullRole: UserSchema = {
        ...mockUserSchema,
        roleType: null,
      };

      const mockIdentityUsecase = createMockIdentityUsecase();
      (mockIdentityUsecase.registerUser as jest.Mock).mockResolvedValue({
        ok: true,
        data: userSchemaWithNullRole,
      });

      const service = identityService({
        identityUsecase: mockIdentityUsecase,
        maker: mockMaker,
      });

      const result = await service.identityServiceRegister(mockContext, {
        registerRequest: {
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!",
          phoneNumber: "+1234567890",
        },
      });

      expect(result.ok).toBe(true);
      expect(mockMaker.createToken).toHaveBeenCalledWith({
        userID: "1",
        username: "johndoe",
        permission: "",
        role: "user", // Should use fallback for null roleType
        duration: 15 * 60 * 1000,
        instanceID: "default-instance",
        roleID: "user",
      });
    });
  });
});
