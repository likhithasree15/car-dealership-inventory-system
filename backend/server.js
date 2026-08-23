const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes, Op } = require("sequelize");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "car_dealership_secret_key";

// SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "car_dealership.sqlite",
  logging: false,
});

// =========================
// MODELS
// =========================

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
  },
});

const Vehicle = sequelize.define("Vehicle", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  make: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0,
    },
  },

  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  mileage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  fuel: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  transmission: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// =========================
// AUTH MIDDLEWARE
// =========================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}

// =========================
// AUTH APIs
// =========================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// =========================
// VEHICLE APIs
// =========================

// GET ALL AVAILABLE VEHICLES
app.get("/api/vehicles", authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: {
        quantity: {
          [Op.gt]: 0,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(vehicles);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch vehicles",
    });
  }
});

// SEARCH VEHICLES
app.get(
  "/api/vehicles/search",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        make,
        model,
        category,
        minPrice,
        maxPrice,
      } = req.query;

      const where = {
        quantity: {
          [Op.gt]: 0,
        },
      };

      if (make) {
        where.make = {
          [Op.like]: `%${make}%`,
        };
      }

      if (model) {
        where.model = {
          [Op.like]: `%${model}%`,
        };
      }

      if (category) {
        where.category = category;
      }

      if (minPrice || maxPrice) {
        where.price = {};

        if (minPrice) {
          where.price[Op.gte] = Number(minPrice);
        }

        if (maxPrice) {
          where.price[Op.lte] = Number(maxPrice);
        }
      }

      const vehicles = await Vehicle.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      res.json(vehicles);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Vehicle search failed",
      });
    }
  }
);

// ADD VEHICLE
app.post(
  "/api/vehicles",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        make,
        model,
        category,
        price,
        quantity,
        year,
        mileage,
        fuel,
        transmission,
        color,
      } = req.body;

      if (
        !make ||
        !model ||
        !category ||
        price === undefined ||
        quantity === undefined
      ) {
        return res.status(400).json({
          message:
            "Make, model, category, price and quantity are required",
        });
      }

      if (Number(price) < 0 || Number(quantity) < 0) {
        return res.status(400).json({
          message: "Price and quantity cannot be negative",
        });
      }

      const vehicle = await Vehicle.create({
        make,
        model,
        category,
        price: Number(price),
        quantity: Number(quantity),
        year,
        mileage,
        fuel,
        transmission,
        color,
      });

      res.status(201).json({
        message: "Vehicle added successfully",
        vehicle,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to add vehicle",
      });
    }
  }
);

// UPDATE VEHICLE
app.put(
  "/api/vehicles/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
        });
      }

      const {
        make,
        model,
        category,
        price,
        quantity,
        year,
        mileage,
        fuel,
        transmission,
        color,
      } = req.body;

      await vehicle.update({
        make: make ?? vehicle.make,
        model: model ?? vehicle.model,
        category: category ?? vehicle.category,
        price:
          price !== undefined
            ? Number(price)
            : vehicle.price,
        quantity:
          quantity !== undefined
            ? Number(quantity)
            : vehicle.quantity,
        year: year ?? vehicle.year,
        mileage: mileage ?? vehicle.mileage,
        fuel: fuel ?? vehicle.fuel,
        transmission:
          transmission ?? vehicle.transmission,
        color: color ?? vehicle.color,
      });

      res.json({
        message: "Vehicle updated successfully",
        vehicle,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update vehicle",
      });
    }
  }
);

// DELETE VEHICLE - ADMIN ONLY
app.delete(
  "/api/vehicles/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
        });
      }

      await vehicle.destroy();

      res.json({
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to delete vehicle",
      });
    }
  }
);

// =========================
// PURCHASE
// =========================

app.post(
  "/api/vehicles/:id/purchase",
  authenticateToken,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
        });
      }

      if (vehicle.quantity <= 0) {
        return res.status(400).json({
          message: "Vehicle is out of stock",
        });
      }

      vehicle.quantity -= 1;

      await vehicle.save();

      res.json({
        message: "Vehicle purchased successfully",
        vehicle,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Purchase failed",
      });
    }
  }
);

// =========================
// RESTOCK - ADMIN ONLY
// =========================

app.post(
  "/api/vehicles/:id/restock",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { quantity } = req.body;

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message: "Restock quantity must be greater than zero",
        });
      }

      const vehicle = await Vehicle.findByPk(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
        });
      }

      vehicle.quantity += Number(quantity);

      await vehicle.save();

      res.json({
        message: "Vehicle restocked successfully",
        vehicle,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Restock failed",
      });
    }
  }
);

// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "Car Dealership Inventory API is running",
  });
});

// =========================
// DATABASE + SERVER
// =========================

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully");

    await sequelize.sync();

    console.log("Database tables synchronized");

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Unable to start server:",
      error
    );
  }
}

startServer();

module.exports = {
  app,
  sequelize,
  User,
  Vehicle,
};