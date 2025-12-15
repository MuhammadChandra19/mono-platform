import type { PermissionRepository } from "../index";

export const createMockPermissionRepository = (): PermissionRepository => {
  return {
    getPermission: jest.fn(),
    getPermissionByIds: jest.fn(),
    createPermission: jest.fn(),
    createUserPermission: jest.fn(),
    getUserPermissions: jest.fn(),
    deleteUserPermissions: jest.fn(),
  };
};

export const mockPermissionRepository = createMockPermissionRepository();

const permissionRepository = jest.fn(() => mockPermissionRepository);

export default permissionRepository;
