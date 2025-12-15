import identityUsecase from "../identity";
import { createMockUserRepository } from "@/data/repositories/user/__mocks__";
import {
  RegisterRequest,
  UserStatusEnum,
  UserGenderEnum,
  UserRoleTypeEnum,
} from "@packages/openapigen";
import { DatabaseErrorCode } from "@/utils/types/database";
import { ErrorCode } from "@/utils/types/result";
import type { UserSchema } from "@/data/schemas/user/entity";

describe("indentity.ts", () => {
  describe("register", () => {
    test("should successfully register a user with valid data", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "securepassword123",
      };

      const expectedUser = {
        id: 1,
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "securepassword123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockUserRepo.create as jest.Mock).mockResolvedValue({
        ok: true,
        data: expectedUser,
      });

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "securepassword123",
      });
      expect(result).toEqual({
        ok: true,
        data: expectedUser,
      });
    });

    test("should return validation error when fullname is missing", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "securepassword123",
      };

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.RequiredField,
          message: "Fullname is required",
          details: { field: "fullname" },
        },
      });
    });

    test("should return validation error when password is missing", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
      };

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.RequiredField,
          message: "Password is required",
          details: { field: "password" },
        },
      });
    });

    test("should return validation error when username is missing", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "securepassword123",
      };

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.RequiredField,
          message: "Username is required",
          details: { field: "username" },
        },
      });
    });

    test("should return validation error when email is missing", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        username: "johndoe",
        phoneNumber: "+1234567890",
        password: "securepassword123",
      };

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.RequiredField,
          message: "Email is required",
          details: { field: "email" },
        },
      });
    });

    test("should return validation error when phoneNumber is missing", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "securepassword123",
      };

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.RequiredField,
          message: "Phone number is required",
          details: { field: "phoneNumber" },
        },
      });
    });

    test("should return database error when user creation fails", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "securepassword123",
      };

      const databaseError = {
        code: DatabaseErrorCode.UniqueViolation,
        message: "Email already exists",
        details: { field: "email" },
      };

      (mockUserRepo.create as jest.Mock).mockResolvedValue({
        ok: false,
        error: databaseError,
      });

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password:
          "$2b$10$tqW4BZsfhOkMi.gGoxkZmeLIdJfGOgp6cm.qwIXpy8MHh9pZ5VB3q",
      });
      expect(result).toEqual({
        ok: false,
        error: databaseError,
      });
    });

    test("should return no data error when database returns empty result", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const registerRequest: RegisterRequest = {
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password:
          "$2b$10$iQNFlyvAZUuXnyYKDmOwoO3DunXFpOvze9paeOMKG2wAfQFlzfI5e",
      };

      (mockUserRepo.create as jest.Mock).mockResolvedValue({
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data returned",
        },
      });

      const result = await usecase.registerUser(registerRequest);

      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data returned",
        },
      });
    });
  });

  describe("getUserByID", () => {
    test("should successfully retrieve a user by ID", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const expectedUser = {
        id: 1,
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        profilePic: null,
        address: null,
        gender: null,
        dateOfBirth: null,
        placeOfBirth: null,
        roleType: null,
        status: UserStatusEnum.UserStatusActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "password123",
      };

      (mockUserRepo.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: expectedUser,
      });

      const result = await usecase.getUserByID(1);

      expect(mockUserRepo.get).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: true,
        data: expectedUser,
      });
    });

    test("should return error when user is not found", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      (mockUserRepo.get as jest.Mock).mockResolvedValue({
        ok: false,
        error: {
          code: DatabaseErrorCode.NotFound,
          message: "User not found",
        },
      });

      const result = await usecase.getUserByID(999);

      expect(mockUserRepo.get).toHaveBeenCalledWith(999);
      expect(result).toEqual({
        ok: false,
        error: {
          code: DatabaseErrorCode.NotFound,
          message: "User not found",
        },
      });
    });
  });

  describe("updateUser", () => {
    test("should successfully update a user", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const updateData = {
        fullname: "Updated Name",
        email: "updated@example.com",
      };

      const expectedUser = {
        id: 1,
        fullname: "Updated Name",
        username: "johndoe",
        email: "updated@example.com",
        phoneNumber: "+1234567890",
        profilePic: null,
        address: null,
        gender: null,
        dateOfBirth: null,
        placeOfBirth: null,
        roleType: null,
        status: UserStatusEnum.UserStatusActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "password123",
      };

      (mockUserRepo.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: expectedUser,
      });

      const result = await usecase.updateUser(1, updateData);

      expect(mockUserRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({
        ok: true,
        data: expectedUser,
      });
    });

    test("should return error when update fails", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      (mockUserRepo.update as jest.Mock).mockResolvedValue({
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data updated",
        },
      });

      const result = await usecase.updateUser(1, { fullname: "New Name" });

      expect(mockUserRepo.update).toHaveBeenCalledWith(1, {
        fullname: "New Name",
      });
      expect(result).toEqual({
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data updated",
        },
      });
    });
  });

  describe("deleteUser", () => {
    test("should successfully delete a user", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const expectedUser = {
        id: 1,
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        profilePic: null,
        address: null,
        gender: null,
        dateOfBirth: null,
        placeOfBirth: null,
        roleType: null,
        status: UserStatusEnum.UserStatusActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "password123",
      };

      (mockUserRepo.remove as jest.Mock).mockResolvedValue({
        ok: true,
        data: expectedUser,
      });

      const result = await usecase.deleteUser(1);

      expect(mockUserRepo.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: true,
        data: expectedUser,
      });
    });

    test("should return error when delete fails", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      (mockUserRepo.remove as jest.Mock).mockResolvedValue({
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data deleted",
        },
      });

      const result = await usecase.deleteUser(1);

      expect(mockUserRepo.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: false,
        error: {
          code: DatabaseErrorCode.NoData,
          message: "No data deleted",
        },
      });
    });
  });

  describe("listUsers", () => {
    test("should successfully list users with default parameters", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const mockUsers: UserSchema[] = [
        {
          id: 1,
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          phoneNumber: "+1234567890",
          profilePic: null,
          address: null,
          gender: null,
          dateOfBirth: null,
          placeOfBirth: null,
          roleType: null,
          status: UserStatusEnum.UserStatusActive,
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "password123",
        },
        {
          id: 2,
          fullname: "Jane Smith",
          username: "janesmith",
          email: "jane@example.com",
          phoneNumber: "+0987654321",
          profilePic: null,
          address: null,
          gender: null,
          dateOfBirth: null,
          placeOfBirth: null,
          roleType: null,
          status: UserStatusEnum.UserStatusActive,
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "password456",
        },
      ];

      (mockUserRepo.list as jest.Mock).mockResolvedValue({
        ok: true,
        data: {
          data: mockUsers,
          pageInfo: {
            nextCursor: undefined,
            hasNextPage: false,
            count: 2,
          },
        },
      });

      const result = await usecase.listUsers();

      expect(mockUserRepo.list).toHaveBeenCalledWith(undefined);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toEqual(mockUsers);
        expect(result.data.pageInfo.count).toBe(2);
        expect(result.data.pageInfo.hasNextPage).toBe(false);
      }
    });

    test("should list users with filters and pagination", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      const mockUsers: UserSchema[] = [
        {
          id: 1,
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          phoneNumber: "+1234567890",
          profilePic: null,
          address: null,
          gender: UserGenderEnum.Male,
          dateOfBirth: null,
          placeOfBirth: null,
          roleType: UserRoleTypeEnum.User,
          status: UserStatusEnum.UserStatusActive,
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "password123",
        },
      ];

      const params = {
        cursor: 0,
        limit: 10,
        filters: {
          fullname: "John",
          status: UserStatusEnum.UserStatusActive,
        },
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      (mockUserRepo.list as jest.Mock).mockResolvedValue({
        ok: true,
        data: {
          data: mockUsers,
          pageInfo: {
            nextCursor: 1,
            hasNextPage: false,
            count: 1,
          },
        },
      });

      const result = await usecase.listUsers(params);

      expect(mockUserRepo.list).toHaveBeenCalledWith(params);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toEqual(mockUsers);
        expect(result.data.pageInfo.count).toBe(1);
      }
    });

    test("should return error when list fails", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      (mockUserRepo.list as jest.Mock).mockResolvedValue({
        ok: false,
        error: {
          code: DatabaseErrorCode.UndefinedTable,
          message: "Undefined table",
        },
      });

      const result = await usecase.listUsers();

      expect(mockUserRepo.list).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        ok: false,
        error: {
          code: DatabaseErrorCode.UndefinedTable,
          message: "Undefined table",
        },
      });
    });

    test("should handle empty results", async () => {
      const mockUserRepo = createMockUserRepository();
      const usecase = identityUsecase({ userRepo: mockUserRepo });

      (mockUserRepo.list as jest.Mock).mockResolvedValue({
        ok: true,
        data: {
          data: [],
          pageInfo: {
            nextCursor: undefined,
            hasNextPage: false,
            count: 0,
          },
        },
      });

      const result = await usecase.listUsers({
        filters: { email: "nonexistent@example.com" },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toEqual([]);
        expect(result.data.pageInfo.count).toBe(0);
      }
    });
  });
});
