import initServices from "../../services";

const { services } = initServices();
describe("Identity Service", () => {
  describe("Register User", () => {
    test("should register user successfully and return tokens", async () => {
      const now = Date.now();
      const randomEmail = `user${now}@example.com`;
      const randomPhone = `6287909${Math.floor(100000 + Math.random() * 900000)}`;
      const registerResponse =
        await services.identityService.identityServiceRegister({
          registerRequest: {
            fullname: "e2e test user " + now,
            phoneNumber: randomPhone,
            username: `testuser${now}`,
            email: randomEmail,
            password: "testPassword123!",
            loginChallenge: "string",
          },
        });

      expect(registerResponse).toBeDefined();

      expect(registerResponse.message).toBe("User registered successfully");
      expect(registerResponse.user?.fullname).toEqual("e2e test user " + now);
    });

    test("should fail when registering with duplicate email", async () => {
      const now = Date.now();
      const duplicateEmail = `duplicate${now}@example.com`;
      const randomPhone1 = `6287909${Math.floor(100000 + Math.random() * 900000)}`;
      const randomPhone2 = `6287909${Math.floor(100000 + Math.random() * 900000)}`;

      // First registration - should succeed
      await services.identityService.identityServiceRegister({
        registerRequest: {
          fullname: "E2E First User",
          phoneNumber: randomPhone1,
          username: `firstuser${now}`,
          email: duplicateEmail,
          password: "testPassword123!",
          loginChallenge: "string",
        },
      });

      // Second registration with same email - should fail
      await expect(
        services.identityService.identityServiceRegister({
          registerRequest: {
            fullname: "E2E Second User",
            phoneNumber: randomPhone2,
            username: `seconduser${now}`,
            email: duplicateEmail, // Duplicate email
            password: "testPassword123!",
            loginChallenge: "string",
          },
        }),
      ).rejects.toThrow();
    });

    test("should fail when registering with duplicate username", async () => {
      const now = Date.now();
      const duplicateUsername = `duplicateuser${now}`;
      const randomPhone1 = `6287909${Math.floor(100000 + Math.random() * 900000)}`;
      const randomPhone2 = `6287909${Math.floor(100000 + Math.random() * 900000)}`;

      // First registration - should succeed
      await services.identityService.identityServiceRegister({
        registerRequest: {
          fullname: "E2E First User",
          phoneNumber: randomPhone1,
          username: duplicateUsername,
          email: `first${now}@example.com`,
          password: "testPassword123!",
          loginChallenge: "string",
        },
      });

      // Second registration with same username - should fail
      await expect(
        services.identityService.identityServiceRegister({
          registerRequest: {
            fullname: "E2E Second User",
            phoneNumber: randomPhone2,
            username: duplicateUsername, // Duplicate username
            email: `second${now}@example.com`,
            password: "testPassword123!",
            loginChallenge: "string",
          },
        }),
      ).rejects.toThrow();
    });
  });
});
