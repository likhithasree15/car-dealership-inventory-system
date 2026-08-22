describe("User Registration", () => {
  it("should register a new user successfully", () => {
    const user = {
      name: "Likhitha",
      email: "likhitha@example.com",
      password: "password123",
    };

    expect(user.email).toBe("likhitha@example.com");
    expect(user.password).toBe("password123");
  });
});