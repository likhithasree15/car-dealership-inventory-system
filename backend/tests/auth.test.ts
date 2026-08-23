import { registerUser } from "../src/auth";

describe("User Registration", () => {
  it("should register a new user successfully", () => {
    const user = registerUser(
      "Likhitha",
      "likhitha@example.com",
      "password123"
    );

    expect(user.name).toBe("Likhitha");
    expect(user.email).toBe("likhitha@example.com");
    expect(user.password).toBe("password123");
  });
});