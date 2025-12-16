import initServices from '../../services';

const { services } = initServices();

describe("Auth Service", () => {
  describe("Login", () => {
    test("should login successfully with valid credentials", async () => {
      // Using existing test user
      const email = "user1765864556136@example.com";
      const password = "testPassword123!";

      const loginResponse = await services.authService.authServiceLogin({
        loginRequest: {
          email: email,
          password: password,
        },
      });

      expect(loginResponse).toBeDefined();
      expect(loginResponse.message).toBe("Login successful");
      expect(loginResponse.loginEntity).toBeDefined();
      expect(loginResponse.loginEntity?.sessionToken).toBeDefined();
      expect(loginResponse.loginEntity?.refreshToken).toBeDefined();
    });

    test("should fail login with incorrect password", async () => {
      const email = "user1765864556136@example.com";
      const wrongPassword = "wrongPassword123!";

      await expect(
        services.authService.authServiceLogin({
          loginRequest: {
            email: email,
            password: wrongPassword,
          },
        })
      ).rejects.toThrow();
    });

    test("should fail login with non-existent email", async () => {
      const nonExistentEmail = "nonexistent@example.com";
      const password = "testPassword123!";

      await expect(
        services.authService.authServiceLogin({
          loginRequest: {
            email: nonExistentEmail,
            password: password,
          },
        })
      ).rejects.toThrow();
    });

    test("should fail login with empty email", async () => {
      const password = "testPassword123!";

      await expect(
        services.authService.authServiceLogin({
          loginRequest: {
            email: "",
            password: password,
          },
        })
      ).rejects.toThrow();
    });

    test("should fail login with empty password", async () => {
      const email = "user1765864556136@example.com";

      await expect(
        services.authService.authServiceLogin({
          loginRequest: {
            email: email,
            password: "",
          },
        })
      ).rejects.toThrow();
    });
  });
});
