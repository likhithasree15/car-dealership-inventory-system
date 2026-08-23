const request = require("supertest");
const { app, sequelize, User } = require("../server");

describe("Authentication API", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Likhitha",
        email: "likhitha@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.name).toBe("Likhitha");
    expect(response.body.user.email).toBe("likhitha@example.com");
  });

  test("should login an existing user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "likhitha@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("should reject invalid login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "likhitha@example.com",
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(401);
  });
});