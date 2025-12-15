import type { Authenticator } from "../authenticator";

export const createMockAuthenticator = (): Authenticator => {
  return {
    mustHaveScope: jest.fn(),
    mustHaveArrScopes: jest.fn(),
  };
};

export const mockAuthenticator = createMockAuthenticator();

const createAuthenticator = jest.fn(() => mockAuthenticator);

export default createAuthenticator;
export { createAuthenticator };
