const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const DB_NAME = process.env.DB_NAME || "car_dealership";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const JWT_SECRET =
  process.env.JWT_SECRET || "car_dealership_secret_key";

/* CREATE DATABASE AUTOMATICALLY */
async function createDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``
  );

  await connection.end();

  console.log(`Database "${DB_NAME}" is ready`);
}

/* SEQUELIZE */
const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

/* USER MODEL */
const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

/* VEHICLE MODEL */
const Vehicle = sequelize.define("Vehicle", {
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },

  model: {
    type: DataTypes.STRING,
    allowNull: false
  },

  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },

  mileage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  fuel: {
    type: DataTypes.STRING,
    allowNull: false
  },

  transmission: {
    type: DataTypes.STRING,
    allowNull: false
  },

  color: {
    type: DataTypes.STRING,
    allowNull: false
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Available"
  }
});

/* AUTHENTICATION */
function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = authorization.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

/* HOME */
app.get("/", (req, res) => {
  res.json({
    message: "Car Dealership Inventory API",
    status: "running"
  });
});

/* REGISTER */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* LOGIN */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* GET VEHICLES */
app.get(
  "/api/vehicles",
  authenticate,
  async (req, res) => {
    try {
      const vehicles = await Vehicle.findAll({
        order: [["createdAt", "DESC"]]
      });

      res.json(vehicles);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

/* GET VEHICLE */
app.get(
  "/api/vehicles/:id",
  authenticate,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(
        req.params.id
      );

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found"
        });
      }

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

/* ADD VEHICLE */
app.post(
  "/api/vehicles",
  authenticate,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.create(req.body);

      res.status(201).json({
        message: "Vehicle added successfully",
        vehicle
      });
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  }
);

/* UPDATE VEHICLE */
app.put(
  "/api/vehicles/:id",
  authenticate,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(
        req.params.id
      );

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found"
        });
      }

      await vehicle.update(req.body);

      res.json({
        message: "Vehicle updated successfully",
        vehicle
      });
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  }
);

/* DELETE VEHICLE */
app.delete(
  "/api/vehicles/:id",
  authenticate,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(
        req.params.id
      );

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found"
        });
      }

      await vehicle.destroy();

      res.json({
        message: "Vehicle deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

/* SERVER */
async function startServer() {
  try {
    await createDatabase();

    await sequelize.authenticate();

    console.log("MySQL connection established");

    await sequelize.sync();

    console.log("Database tables synchronized");

    app.listen(3000, () => {
      console.log(
        "Server running on http://localhost:3000"
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );
  }
}

startServer();

module.exports = app;