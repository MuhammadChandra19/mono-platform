import type { IdentityUsecase } from "../identity";

export const createMockIdentityUsecase = (): IdentityUsecase => {
  return {
    registerUser: jest.fn(),
    getUserByID: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    listUsers: jest.fn(),
  };
};

export const mockIdentityUsecase = createMockIdentityUsecase();

const identityUsecase = jest.fn(() => mockIdentityUsecase);

export default identityUsecase;
