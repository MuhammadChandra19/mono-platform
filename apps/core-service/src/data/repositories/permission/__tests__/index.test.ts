import permissionRepository from "..";
import permissionSchema, {
  NewPermission,
  PermissionSchema,
} from "@/data/schemas/permission/entity";
import userPermissionSchema, {
  NewUserPermission,
  UserPermissionSchema,
} from "@/data/schemas/userPermission/entity";
import { mapDatabaseError } from "@/utils/helpers/mapDatabaseError";

describe("permissionRepository", () => {
  describe("getPermission", () => {
    test("should retrieve a permission by ID", async () => {
      const mockPermission: PermissionSchema = {
        id: "user:read",
        action: "read",
        resourceName: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
      };

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockPermission]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getPermission("user:read");

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        data: mockPermission,
      });
    });

    test("should return an error when permission is not found", async () => {
      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getPermission("nonexistent:permission");

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: false,
        error: { code: "NOT_FOUND", message: "Permission not found" },
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "42P01", message: "Undefined table" };
      const mockDb = {
        select: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getPermission("user:read");

      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });

  describe("getPermissionByIds", () => {
    test("should retrieve multiple permissions by IDs", async () => {
      const mockPermissions: PermissionSchema[] = [
        {
          id: "user:read",
          action: "read",
          resourceName: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
        {
          id: "user:write",
          action: "write",
          resourceName: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockPermissions),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getPermissionByIds(["user:read", "user:write"]);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        data: mockPermissions,
      });
    });

    test("should return empty array when no permissions found", async () => {
      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getPermissionByIds(["nonexistent:permission"]);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        data: [],
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "42P01", message: "Undefined table" };
      const mockDb = {
        select: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getPermissionByIds(["user:read"]);

      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });

  describe("createPermission", () => {
    test("should create permissions successfully", async () => {
      const mockPermissions: PermissionSchema[] = [
        {
          id: "user:read",
          action: "read",
          resourceName: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
      ];

      const mockDb = {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockPermissions),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const newPermissions: NewPermission[] = [
        {
          id: "user:read",
          action: "read",
          resourceName: "user",
        },
      ];

      const result = await repo.createPermission(newPermissions);

      expect(mockDb.insert).toHaveBeenCalledWith(permissionSchema);
      expect(result).toEqual({
        ok: true,
        data: mockPermissions,
      });
    });

    test("should return error when no data is returned", async () => {
      const mockDb = {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const newPermissions: NewPermission[] = [
        {
          id: "user:read",
          action: "read",
          resourceName: "user",
        },
      ];

      const result = await repo.createPermission(newPermissions);

      expect(result).toEqual({
        ok: false,
        error: { code: "NO_DATA", message: "No data returned" },
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "23505", details: { field: "id" } };
      const mockDb = {
        insert: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const newPermissions: NewPermission[] = [
        {
          id: "user:read",
          action: "read",
          resourceName: "user",
        },
      ];

      const result = await repo.createPermission(newPermissions);

      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });

  describe("createUserPermission", () => {
    test("should create user permissions successfully", async () => {
      const mockUserPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockDb = {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockUserPermissions),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const newUserPermissions: NewUserPermission[] = [
        {
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
        },
      ];

      const result = await repo.createUserPermission(newUserPermissions);

      expect(mockDb.insert).toHaveBeenCalledWith(userPermissionSchema);
      expect(result).toEqual({
        ok: true,
        data: mockUserPermissions,
      });
    });

    test("should return error when no data is returned", async () => {
      const mockDb = {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const newUserPermissions: NewUserPermission[] = [
        {
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
        },
      ];

      const result = await repo.createUserPermission(newUserPermissions);

      expect(result).toEqual({
        ok: false,
        error: { code: "NO_DATA", message: "No data returned" },
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "23505", details: { field: "userId" } };
      const mockDb = {
        insert: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const newUserPermissions: NewUserPermission[] = [
        {
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
        },
      ];

      const result = await repo.createUserPermission(newUserPermissions);

      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });

  describe("getUserPermissions", () => {
    test("should retrieve user permissions by user ID", async () => {
      const mockUserPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 10,
          permissionId: "user:write",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockUserPermissions),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getUserPermissions(10);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        data: mockUserPermissions,
      });
    });

    test("should return empty array when user has no permissions", async () => {
      const mockDb = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getUserPermissions(10);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        data: [],
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "42P01", message: "Undefined table" };
      const mockDb = {
        select: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.getUserPermissions(10);

      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });

  describe("deleteUserPermissions", () => {
    test("should delete user permissions successfully", async () => {
      const mockUserPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockDb = {
        delete: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockUserPermissions),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.deleteUserPermissions(10, ["user:read"]);

      expect(mockDb.delete).toHaveBeenCalledWith(userPermissionSchema);
      expect(result).toEqual({
        ok: true,
        data: mockUserPermissions,
      });
    });

    test("should return error when no permissions are deleted", async () => {
      const mockDb = {
        delete: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.deleteUserPermissions(10, ["user:read"]);

      expect(mockDb.delete).toHaveBeenCalledWith(userPermissionSchema);
      expect(result).toEqual({
        ok: false,
        error: { code: "NO_DATA", message: "No data deleted" },
      });
    });

    test("should delete multiple permissions", async () => {
      const mockUserPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "user:read",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 10,
          permissionId: "user:write",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockDb = {
        delete: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(mockUserPermissions),
          }),
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.deleteUserPermissions(10, [
        "user:read",
        "user:write",
      ]);

      expect(mockDb.delete).toHaveBeenCalledWith(userPermissionSchema);
      expect(result).toEqual({
        ok: true,
        data: mockUserPermissions,
      });
    });

    test("should return a mapped database error on failure", async () => {
      const mockError = { code: "42P01", message: "Undefined table" };
      const mockDb = {
        delete: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      };

      const repo = permissionRepository({ db: mockDb as any });
      const result = await repo.deleteUserPermissions(10, ["user:read"]);

      expect(result).toEqual({
        ok: false,
        error: mapDatabaseError(mockError),
      });
    });
  });
});
