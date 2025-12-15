import type { PermissionUsecase } from "../permission";

export const createMockPermissionUsecase = (): PermissionUsecase => {
  return {
    getUserPermissions: jest.fn(),
    assignPermissionToUser: jest.fn(),
    deleteUserPermissions: jest.fn(),
  };
};

export const mockPermissionUsecase = createMockPermissionUsecase();

const permissionUsecase = jest.fn(() => mockPermissionUsecase);

export default permissionUsecase;
