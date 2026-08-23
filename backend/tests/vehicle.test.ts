const request = require("supertest");
const { app, sequelize, User } = require("../server");

describe("Vehicle API", () => {
  let adminToken;
  let userToken;
  let vehicleId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });

    const user = await User.create({
      name: "User",
      email: "user@example.com",
      password: await bcrypt.hash("user123", 10),
      role: "user",
    });

    const secret =
      process.env.JWT_SECRET || "car_dealership_secret_key";

    adminToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      secret
    );

    userToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      secret
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("admin should add a vehicle", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Fortuner",
        category: "SUV",
        price: 3850000,
        quantity: 5,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.vehicle.make).toBe("Toyota");

    vehicleId = response.body.vehicle.id;
  });

  test("user should view vehicles", async () => {
    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
  });

  test("user should search vehicles", async () => {
    const response = await request(app)
      .get("/api/vehicles/search?make=Toyota")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
  });

  test("user should purchase a vehicle", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
  });

  test("admin should restock a vehicle", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        quantity: 3,
      });

    expect(response.statusCode).toBe(200);
  });

  test("normal user cannot delete a vehicle", async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("admin should update a vehicle", async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        price: 4000000,
      });

    expect(response.statusCode).toBe(200);
  });

  test("admin should delete a vehicle", async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
  });
});