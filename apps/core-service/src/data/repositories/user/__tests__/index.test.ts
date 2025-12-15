import userRepository from "..";
import userSchema, { NewUser, UserSchema } from "@/data/schemas/user/entity";
import { mapDatabaseError } from "@/utils/helpers/mapDatabaseError";
import {
  UserStatusEnum,
  UserGenderEnum,
  UserRoleTypeEnum,
} from "@packages/openapigen";

describe("userRepository", () => {
  describe("create", () => {
    test("should create a user successfully", async () => {
      const mockDb = {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest
              .fn()
              .mockResolvedValue([{ id: 1, fullname: "John Doe" }]),
          }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const newUser: NewUser = {
        fullname: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
      };

      const result = await repo.create(newUser);

      expect(mockDb.insert).toHaveBeenCalledWith(userSchema);
      expect(result).toEqual({
        ok: true,
        data: { id: 1, fullname: "John Doe" },
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "23505", details: { field: "email" } };
      const mockDb = {
        insert: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const newUser: NewUser = {
        fullname: "Error User",
        email: "error@example.com",
        password: "password123",
      };

      const result = await repo.create(newUser);

      expect(mockDb.insert).toHaveBeenCalledWith(userSchema);
      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });

  describe("get", () => {
    test("should retrieve a user by ID", async () => {
      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest
              .fn()
              .mockResolvedValue([{ id: 1, fullname: "John Doe" }]),
          }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const result = await repo.get(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        data: { id: 1, fullname: "John Doe" },
      });
    });

    test("should return an error when user is not found", async () => {
      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest
            .fn()
            .mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const result = await repo.get(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    });
  });

  describe("update", () => {
    test("should update a user successfully", async () => {
      const mockDb = {
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest
                .fn()
                .mockResolvedValue([{ id: 1, fullname: "Updated Name" }]),
            }),
          }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const result = await repo.update(1, { fullname: "Updated Name" });

      expect(mockDb.update).toHaveBeenCalledWith(userSchema);
      expect(result).toEqual({
        ok: true,
        data: { id: 1, fullname: "Updated Name" },
      });
    });

    test("should return an error when no user is updated", async () => {
      const mockDb = {
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const result = await repo.update(1, { fullname: "No Update" });

      expect(mockDb.update).toHaveBeenCalledWith(userSchema);
      expect(result).toEqual({
        ok: false,
        error: { code: "NO_DATA", message: "No data updated" },
      });
    });
  });

  describe("remove", () => {
    test("should delete a user successfully", async () => {
      const mockDb = {
        delete: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest
              .fn()
              .mockResolvedValue([{ id: 1, fullname: "Deleted User" }]),
          }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const result = await repo.remove(1);

      expect(mockDb.delete).toHaveBeenCalledWith(userSchema);
      expect(result).toEqual({
        ok: true,
        data: { id: 1, fullname: "Deleted User" },
      });
    });

    test("should return an error when no user is deleted", async () => {
      const mockDb = {
        delete: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }),
        }),
      };
      const repo = userRepository({ db: mockDb as any });

      const result = await repo.remove(1);

      expect(mockDb.delete).toHaveBeenCalledWith(userSchema);
      expect(result).toEqual({
        ok: false,
        error: { code: "NO_DATA", message: "No data deleted" },
      });
    });
  });

  describe("list", () => {
    test("should list users with default pagination", async () => {
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

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list();

      expect(mockDb.select).toHaveBeenCalled();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toEqual(mockUsers);
        expect(result.data.pageInfo.count).toBe(2);
        expect(result.data.pageInfo.hasNextPage).toBe(false);
      }
    });

    test("should list users with cursor and limit", async () => {
      const mockUsers: UserSchema[] = [
        {
          id: 11,
          fullname: "User 11",
          username: "user11",
          email: "user11@example.com",
          phoneNumber: "+1111111111",
          profilePic: null,
          address: null,
          gender: null,
          dateOfBirth: null,
          placeOfBirth: null,
          roleType: null,
          status: UserStatusEnum.UserStatusActive,
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "password",
        },
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({ cursor: 10, limit: 10 });

      expect(mockDb.select).toHaveBeenCalled();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data.length).toBe(1);
        expect(result.data.pageInfo.hasNextPage).toBe(false);
      }
    });

    test("should detect next page when results exceed limit", async () => {
      const mockUsers: UserSchema[] = Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        fullname: `User ${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        phoneNumber: `+100000000${i}`,
        profilePic: null,
        address: null,
        gender: null,
        dateOfBirth: null,
        placeOfBirth: null,
        roleType: null,
        status: UserStatusEnum.UserStatusActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "password",
      }));

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({ limit: 10 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data.length).toBe(10);
        expect(result.data.pageInfo.hasNextPage).toBe(true);
        expect(result.data.pageInfo.nextCursor).toBe(10);
      }
    });

    test("should filter users by fullname", async () => {
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
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        filters: { fullname: "John" },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data[0].fullname).toContain("John");
      }
    });

    test("should filter users by email", async () => {
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
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        filters: { email: "john@example.com" },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data[0].email).toBe("john@example.com");
      }
    });

    test("should filter users by status", async () => {
      const mockUsers: UserSchema[] = [
        {
          id: 1,
          fullname: "Active User",
          username: "activeuser",
          email: "active@example.com",
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
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        filters: { status: UserStatusEnum.UserStatusActive },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data[0].status).toBe(
          UserStatusEnum.UserStatusActive,
        );
      }
    });

    test("should filter users by multiple criteria", async () => {
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

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        filters: {
          fullname: "John",
          gender: UserGenderEnum.Male,
          status: UserStatusEnum.UserStatusActive,
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data[0].fullname).toContain("John");
        expect(result.data.data[0].gender).toBe(UserGenderEnum.Male);
        expect(result.data.data[0].status).toBe(
          UserStatusEnum.UserStatusActive,
        );
      }
    });

    test("should sort users by createdAt descending", async () => {
      const mockUsers: UserSchema[] = [
        {
          id: 2,
          fullname: "User 2",
          username: "user2",
          email: "user2@example.com",
          phoneNumber: "+1234567890",
          profilePic: null,
          address: null,
          gender: null,
          dateOfBirth: null,
          placeOfBirth: null,
          roleType: null,
          status: UserStatusEnum.UserStatusActive,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date(),
          password: "password",
        },
        {
          id: 1,
          fullname: "User 1",
          username: "user1",
          email: "user1@example.com",
          phoneNumber: "+0987654321",
          profilePic: null,
          address: null,
          gender: null,
          dateOfBirth: null,
          placeOfBirth: null,
          roleType: null,
          status: UserStatusEnum.UserStatusActive,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date(),
          password: "password",
        },
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data[0].id).toBe(2);
      }
    });

    test("should return database error on failure", async () => {
      const mockError = { code: "42P01", message: "Undefined table" };
      const mockDb = {
        select: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(mapDatabaseError(mockError));
      }
    });

    test("should return empty list when no users match filters", async () => {
      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        filters: { email: "nonexistent@example.com" },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toEqual([]);
        expect(result.data.pageInfo.count).toBe(0);
        expect(result.data.pageInfo.hasNextPage).toBe(false);
      }
    });

    test("should handle all filters and pagination parameters together", async () => {
      const createdDate = new Date("2024-01-15");
      const mockUsers: UserSchema[] = [
        {
          id: 5,
          fullname: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          phoneNumber: "+1234567890",
          profilePic: null,
          address: null,
          gender: UserGenderEnum.Male,
          dateOfBirth: new Date("1990-01-01"),
          placeOfBirth: "New York",
          roleType: UserRoleTypeEnum.User,
          status: UserStatusEnum.UserStatusActive,
          createdAt: createdDate,
          updatedAt: new Date(),
          password: "password123",
        },
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      };

      const repo = userRepository({ db: mockDb as any });
      const result = await repo.list({
        cursor: 3,
        limit: 15,
        filters: {
          fullname: "John",
          username: "john",
          email: "john@",
          phoneNumber: "+123",
          gender: UserGenderEnum.Male,
          roleType: UserRoleTypeEnum.User,
          status: UserStatusEnum.UserStatusActive,
          createdAfter: new Date("2024-01-01"),
          createdBefore: new Date("2024-12-31"),
        },
        sortBy: "fullname",
        sortOrder: "asc",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data.length).toBe(1);
        expect(result.data.data[0].fullname).toContain("John");
        expect(result.data.data[0].gender).toBe(UserGenderEnum.Male);
        expect(result.data.data[0].status).toBe(
          UserStatusEnum.UserStatusActive,
        );
        expect(result.data.data[0].roleType).toBe(UserRoleTypeEnum.User);
        expect(result.data.pageInfo.hasNextPage).toBe(false);
      }
    });
  });
});
