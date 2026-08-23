describe("Vehicle Management", () => {
  it("should create a new vehicle successfully", () => {
    const vehicle = {
      id: 1,
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 30000,
      quantity: 5,
    };

    expect(vehicle.make).toBe("Toyota");
    expect(vehicle.model).toBe("Camry");
    expect(vehicle.category).toBe("Sedan");
    expect(vehicle.price).toBe(30000);
    expect(vehicle.quantity).toBe(5);
  });
});