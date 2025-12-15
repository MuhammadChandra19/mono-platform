import type { UserRepository } from "../index";

export const createMockUserRepository = (): UserRepository => {
  return {
    create: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
  };
};

export const mockUserRepository = createMockUserRepository();

const userRepository = jest.fn(() => mockUserRepository);

export default userRepository;
