import permissionUsecase from "../permission";
import { PermissionSchema } from "@/data/schemas/permission/entity";
import { UserPermissionSchema } from "@/data/schemas/userPermission/entity";
import { TransactionWrapper } from "@packages/pkg/postgres";
import { createMockPermissionRepository } from "@/data/repositories/permission/__mocks__";

describe("permissionUsecase", () => {
  const mockTxWrapper: TransactionWrapper = jest.fn(
    async (fn) => await fn(),
  ) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserPermissions", () => {
    const testCases = [
      {
        name: "should retrieve user permissions successfully",
        userId: 1,
        repoResult: {
          ok: true,
          data: [
            {
              id: 1,
              userId: 1,
              permissionId: "read:user",
              createdBy: "admin",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 2,
              userId: 1,
              permissionId: "write:user",
              createdBy: "admin",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ] as UserPermissionSchema[],
        },
        expectedOk: true,
      },
      {
        name: "should return empty array when user has no permissions",
        userId: 2,
        repoResult: {
          ok: true,
          data: [] as UserPermissionSchema[],
        },
        expectedOk: true,
      },
      {
        name: "should handle repository error",
        userId: 3,
        repoResult: {
          ok: false,
          error: {
            code: "DB_ERROR",
            message: "Database connection failed",
          },
        },
        expectedOk: false,
      },
    ];

    test.each(testCases)(
      "$name",
      async ({ userId, repoResult, expectedOk }) => {
        const mockPermissionRepo = createMockPermissionRepository();
        (mockPermissionRepo.getUserPermissions as jest.Mock).mockResolvedValue(
          repoResult,
        );

        const usecase = permissionUsecase({
          permissionRepo: mockPermissionRepo,
          txWrapper: mockTxWrapper,
        });

        const result = await usecase.getUserPermissions(userId);

        expect(result.ok).toBe(expectedOk);
        expect(mockPermissionRepo.getUserPermissions).toHaveBeenCalledWith(
          userId,
        );

        if (expectedOk && repoResult.ok) {
          expect(result.ok && result.data).toEqual(repoResult.data);
        } else if (!expectedOk && !repoResult.ok && repoResult.error) {
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe(repoResult.error.code);
          }
        }
      },
    );
  });

  describe("assignPermissionToUser", () => {
    test("should assign existing permissions to user", async () => {
      const existingPermissions: PermissionSchema[] = [
        {
          id: "read:user",
          action: "read",
          resourceName: "user",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "write:user",
          action: "write",
          resourceName: "user",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const assignedPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "read:user",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 10,
          permissionId: "write:user",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockPermissionRepo = createMockPermissionRepository();
      (mockPermissionRepo.getPermissionByIds as jest.Mock).mockResolvedValue({
        ok: true,
        data: existingPermissions,
      });
      (mockPermissionRepo.createUserPermission as jest.Mock).mockResolvedValue({
        ok: true,
        data: assignedPermissions,
      });

      const usecase = permissionUsecase({
        permissionRepo: mockPermissionRepo,
        txWrapper: mockTxWrapper,
      });

      const result = await usecase.assignPermissionToUser(10, "admin", [
        "read:user",
        "write:user",
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual(assignedPermissions);
      }
      expect(mockPermissionRepo.getPermissionByIds).toHaveBeenCalledWith([
        "read:user",
        "write:user",
      ]);
      expect(mockPermissionRepo.createPermission).not.toHaveBeenCalled();
      expect(mockPermissionRepo.createUserPermission).toHaveBeenCalled();
    });

    test("should create and assign new permissions when they don't exist", async () => {
      const newPermissions: PermissionSchema[] = [
        {
          id: "create:post",
          action: "create",
          resourceName: "post",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const assignedPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "create:post",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockPermissionRepo = createMockPermissionRepository();
      (mockPermissionRepo.getPermissionByIds as jest.Mock).mockResolvedValue({
        ok: true,
        data: [], // No existing permissions
      });
      (mockPermissionRepo.createPermission as jest.Mock).mockResolvedValue({
        ok: true,
        data: newPermissions,
      });
      (mockPermissionRepo.createUserPermission as jest.Mock).mockResolvedValue({
        ok: true,
        data: assignedPermissions,
      });

      const usecase = permissionUsecase({
        permissionRepo: mockPermissionRepo,
        txWrapper: mockTxWrapper,
      });

      const result = await usecase.assignPermissionToUser(10, "admin", [
        "create:post",
      ]);

      expect(result.ok).toBe(true);
      expect(mockPermissionRepo.createPermission).toHaveBeenCalledWith([
        {
          id: "create:post",
          action: "create",
          resourceName: "post",
        },
      ]);
      expect(mockPermissionRepo.createUserPermission).toHaveBeenCalled();
    });

    test("should handle mix of existing and new permissions", async () => {
      const existingPermissions: PermissionSchema[] = [
        {
          id: "read:user",
          action: "read",
          resourceName: "user",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newPermissions: PermissionSchema[] = [
        {
          id: "create:post",
          action: "create",
          resourceName: "post",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const assignedPermissions: UserPermissionSchema[] = [
        {
          id: 1,
          userId: 10,
          permissionId: "read:user",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 10,
          permissionId: "create:post",
          createdBy: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockPermissionRepo = createMockPermissionRepository();
      (mockPermissionRepo.getPermissionByIds as jest.Mock).mockResolvedValue({
        ok: true,
        data: existingPermissions,
      });
      (mockPermissionRepo.createPermission as jest.Mock).mockResolvedValue({
        ok: true,
        data: newPermissions,
      });
      (mockPermissionRepo.createUserPermission as jest.Mock).mockResolvedValue({
        ok: true,
        data: assignedPermissions,
      });

      const usecase = permissionUsecase({
        permissionRepo: mockPermissionRepo,
        txWrapper: mockTxWrapper,
      });

      const result = await usecase.assignPermissionToUser(10, "admin", [
        "read:user",
        "create:post",
      ]);

      expect(result.ok).toBe(true);
      expect(mockPermissionRepo.createPermission).toHaveBeenCalledWith([
        {
          id: "create:post",
          action: "create",
          resourceName: "post",
        },
      ]);
    });

    const errorTestCases = [
      {
        name: "should handle error when getting permission IDs fails",
        getPermissionByIdsResult: {
          ok: false,
          error: {
            code: "DB_ERROR",
            message: "Failed to fetch permissions",
          },
        },
        createPermissionResult: null,
        createUserPermissionResult: null,
        expectedError: "DB_ERROR",
      },
      {
        name: "should handle error when creating new permissions fails",
        getPermissionByIdsResult: {
          ok: true,
          data: [],
        },
        createPermissionResult: {
          ok: false,
          error: {
            code: "CREATE_ERROR",
            message: "Failed to create permission",
          },
        },
        createUserPermissionResult: null,
        expectedError: "CREATE_ERROR",
      },
      {
        name: "should handle error when creating user permission fails",
        getPermissionByIdsResult: {
          ok: true,
          data: [
            {
              id: "read:user",
              action: "read",
              resourceName: "user",
              description: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ] as PermissionSchema[],
        },
        createPermissionResult: null,
        createUserPermissionResult: {
          ok: false,
          error: {
            code: "ASSIGN_ERROR",
            message: "Failed to assign permission",
          },
        },
        expectedError: "ASSIGN_ERROR",
      },
    ];

    test.each(errorTestCases)(
      "$name",
      async ({
        getPermissionByIdsResult,
        createPermissionResult,
        createUserPermissionResult,
        expectedError,
      }) => {
        const mockPermissionRepo = createMockPermissionRepository();
        (mockPermissionRepo.getPermissionByIds as jest.Mock).mockResolvedValue(
          getPermissionByIdsResult,
        );
        (mockPermissionRepo.createPermission as jest.Mock).mockResolvedValue(
          createPermissionResult,
        );
        (
          mockPermissionRepo.createUserPermission as jest.Mock
        ).mockResolvedValue(createUserPermissionResult);

        const usecase = permissionUsecase({
          permissionRepo: mockPermissionRepo,
          txWrapper: mockTxWrapper,
        });

        const result = await usecase.assignPermissionToUser(10, "admin", [
          "read:user",
        ]);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe(expectedError);
        }
      },
    );
  });

  describe("deleteUserPermissions", () => {
    const testCases = [
      {
        name: "should delete user permissions successfully",
        userId: 10,
        permissionIds: ["read:user", "write:user"],
        repoResult: {
          ok: true,
          data: [
            {
              id: 1,
              userId: 10,
              permissionId: "read:user",
              createdBy: "admin",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 2,
              userId: 10,
              permissionId: "write:user",
              createdBy: "admin",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ] as UserPermissionSchema[],
        },
        expectedOk: true,
      },
      {
        name: "should handle error when deleting permissions fails",
        userId: 10,
        permissionIds: ["read:user"],
        repoResult: {
          ok: false,
          error: {
            code: "DELETE_ERROR",
            message: "Failed to delete permissions",
          },
        },
        expectedOk: false,
      },
    ];

    test.each(testCases)(
      "$name",
      async ({ userId, permissionIds, repoResult, expectedOk }) => {
        const mockPermissionRepo = createMockPermissionRepository();
        (
          mockPermissionRepo.deleteUserPermissions as jest.Mock
        ).mockResolvedValue(repoResult);

        const usecase = permissionUsecase({
          permissionRepo: mockPermissionRepo,
          txWrapper: mockTxWrapper,
        });

        const result = await usecase.deleteUserPermissions(
          userId,
          permissionIds,
        );

        expect(result.ok).toBe(expectedOk);
        expect(mockPermissionRepo.deleteUserPermissions).toHaveBeenCalledWith(
          userId,
          permissionIds,
        );

        if (expectedOk && repoResult.ok) {
          expect(result.ok && result.data).toEqual(repoResult.data);
        } else if (!expectedOk && !repoResult.ok && repoResult.error) {
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe(repoResult.error.code);
          }
        }
      },
    );
  });
});
