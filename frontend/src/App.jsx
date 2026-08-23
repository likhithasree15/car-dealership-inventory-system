import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api";

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [vehicle, setVehicle] = useState({
  brand: "",
  model: "",
  category: "",
  year: "",
  price: "",
  quantity: 1,
  mileage: "",
  fuel: "Petrol",
  transmission: "Automatic",
  color: "",
  status: "Available",
});

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  /* ---------------- AUTH ---------------- */

  const register = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful. Please login.");

      setRegisterData({
        name: "",
        email: "",
        password: "",
      });

      setPage("login");
    } catch {
      setMessage("Unable to connect to server");
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);
      setPage("dashboard");

      setLoginData({
        email: "",
        password: "",
      });
    } catch {
      setMessage("Unable to connect to server");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setCars([]);
    setPage("login");
  };

  /* ---------------- VEHICLES ---------------- */

  const loadVehicles = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/vehicles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setCars(data);
      }
    } catch {
      setMessage("Unable to load vehicles");
    }
  };

  useEffect(() => {
    if (token) {
      setPage("dashboard");
      loadVehicles();
    }
  }, [token]);

  const handleVehicleChange = (e) => {
    setVehicle({
      ...vehicle,
      [e.target.name]: e.target.value,
    });
  };

  const saveVehicle = async (e) => {
  e.preventDefault();
  setMessage("");

  const method = editingId ? "PUT" : "POST";

  const url = editingId
    ? `${API_URL}/vehicles/${editingId}`
    : `${API_URL}/vehicles`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...vehicle,
        year: Number(vehicle.year),
        price: Number(vehicle.price),
        quantity: Number(vehicle.quantity),
        mileage: Number(vehicle.mileage),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to save vehicle");
      return;
    }

    setMessage(
      editingId
        ? "Vehicle updated successfully"
        : "Vehicle added successfully"
    );

    resetVehicleForm();
    loadVehicles();
  } catch {
    setMessage("Unable to connect to server");
  }
};

  const editVehicle = (car) => {
  setEditingId(car.id);

  setVehicle({
    brand: car.brand || "",
    model: car.model || "",
    category: car.category || "",
    year: car.year || "",
    price: car.price || "",
    quantity: car.quantity ?? 0,
    mileage: car.mileage || "",
    fuel: car.fuel || "Petrol",
    transmission: car.transmission || "Automatic",
    color: car.color || "",
    status: car.status || "Available",
  });

  setPage("add");
};

  const deleteVehicle = async (id) => {
    if (!window.confirm("Delete this vehicle?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/vehicles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Vehicle deleted successfully");
      loadVehicles();
    } catch {
      setMessage("Unable to connect to server");
    }
  };

  const resetVehicleForm = () => {
  setVehicle({
    brand: "",
    model: "",
    category: "",
    year: "",
    price: "",
    quantity: 1,
    mileage: "",
    fuel: "Petrol",
    transmission: "Automatic",
    color: "",
    status: "Available",
  });

  setEditingId(null);
  setPage("dashboard");
};

  /* ---------------- STATISTICS ---------------- */

  const filteredCars = cars.filter((car) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      car.brand.toLowerCase().includes(searchText) ||
      car.model.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" || car.status === filter;

    return matchesSearch && matchesFilter;
  });

  const availableCars = cars.filter(
    (car) => car.status === "Available"
  ).length;

  const soldCars = cars.filter(
    (car) => car.status === "Sold"
  ).length;

  const totalValue = cars.reduce(
    (total, car) => total + Number(car.price),
    0
  );

  /* ---------------- LOGIN PAGE ---------------- */

  if (!token && page === "login") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-icon">🚗</div>

          <h1>AutoHub</h1>
          <p>Dealership Inventory Management</p>

          <h2>Login</h2>

          {message && (
            <div className="message">{message}</div>
          )}

          <form onSubmit={login}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value,
                })
              }
              required
            />

            <button className="primary-btn">
              Login
            </button>
          </form>

          <p>
            Don't have an account?{" "}
            <button
              className="link-btn"
              onClick={() => {
                setMessage("");
                setPage("register");
              }}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- REGISTER PAGE ---------------- */

  if (!token && page === "register") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-icon">🚗</div>

          <h1>AutoHub</h1>
          <p>Create your dealership account</p>

          <h2>Register</h2>

          {message && (
            <div className="message">{message}</div>
          )}

          <form onSubmit={register}>
            <input
              type="text"
              placeholder="Full Name"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  password: e.target.value,
                })
              }
              required
              minLength="6"
            />

            <button className="primary-btn">
              Create Account
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <button
              className="link-btn"
              onClick={() => {
                setMessage("");
                setPage("login");
              }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- ADD VEHICLE ---------------- */

  if (token && page === "add") {
    return (
      <div className="auth-page">
        <div className="vehicle-form-card">
          <h1>
            {editingId
              ? "Edit Vehicle"
              : "Add New Vehicle"}
          </h1>

          {message && (
            <div className="message">{message}</div>
          )}

          <form
            className="vehicle-form"
            onSubmit={saveVehicle}
          >
            <input
              name="brand"
              placeholder="Brand"
              value={vehicle.brand}
              onChange={handleVehicleChange}
              required
            />

            <input
              name="model"
              placeholder="Model"
              value={vehicle.model}
              onChange={handleVehicleChange}
              required
            />

            <input
              name="year"
              type="number"
              placeholder="Year"
              value={vehicle.year}
              onChange={handleVehicleChange}
              required
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              value={vehicle.price}
              onChange={handleVehicleChange}
              required
            />

            <input
              name="mileage"
              type="number"
              placeholder="Mileage (km)"
              value={vehicle.mileage}
              onChange={handleVehicleChange}
              required
            />

            <input
              name="color"
              placeholder="Color"
              value={vehicle.color}
              onChange={handleVehicleChange}
              required
            />

            <select
              name="fuel"
              value={vehicle.fuel}
              onChange={handleVehicleChange}
            >
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>

            <select
              name="transmission"
              value={vehicle.transmission}
              onChange={handleVehicleChange}
            >
              <option>Automatic</option>
              <option>Manual</option>
            </select>

            <select
              name="status"
              value={vehicle.status}
              onChange={handleVehicleChange}
            >
              <option>Available</option>
              <option>Sold</option>
            </select>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-btn"
              >
                {editingId
                  ? "Update Vehicle"
                  : "Add Vehicle"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetVehicleForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🚗</div>

          <div>
            <h2>AutoHub</h2>
            <span>Dealership</span>
          </div>
        </div>

        <nav>
          <button
            className="nav-item active"
            onClick={() => setPage("dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => setPage("dashboard")}
          >
            🚘 Inventory
          </button>

          <button className="nav-item">
            👥 Customers
          </button>

          <button className="nav-item">
            📋 Sales
          </button>

          <button className="nav-item">
            📈 Reports
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={logout}
          >
            🚪 Logout
          </button>

          <div className="user-profile">
            <div className="avatar">
              {user?.name
                ?.substring(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Inventory Dashboard</h1>
            <p>
              Manage your dealership inventory and
              vehicles.
            </p>
          </div>

          <div className="header-actions">
            <button className="notification">
              🔔
            </button>

            <button
              className="add-btn"
              onClick={() => {
                resetVehicleForm();
                setPage("add");
              }}
            >
              + Add Vehicle
            </button>
          </div>
        </header>

        {message && (
          <div className="message">{message}</div>
        )}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">🚘</div>
            <div>
              <span>Total Vehicles</span>
              <h2>{cars.length}</h2>
              <small className="positive">
                Current inventory
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Available</span>
              <h2>{availableCars}</h2>
              <small className="positive">
                Ready for sale
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              💰
            </div>
            <div>
              <span>Inventory Value</span>
              <h2>
                ₹
                {(
                  totalValue / 10000000
                ).toFixed(2)}{" "}
                Cr
              </h2>
              <small className="positive">
                Current value
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              📈
            </div>
            <div>
              <span>Sold Vehicles</span>
              <h2>{soldCars}</h2>
              <small className="positive">
                This inventory
              </small>
            </div>
          </div>
        </section>

        <section className="inventory-section">
          <div className="section-header">
            <div>
              <h2>Vehicle Inventory</h2>
              <p>
                Browse and manage all vehicles.
              </p>
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              🔍
              <input
                type="text"
                placeholder="Search by brand or model..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >
              <option value="All">
                All Vehicles
              </option>
              <option value="Available">
                Available
              </option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          <div className="car-grid">
            {filteredCars.map((car) => (
              <div
                className="car-card"
                key={car.id}
              >
                <div className="car-image">
                  <div className="car-placeholder">
                    🚘
                  </div>

                  <span
                    className={
                      car.status === "Available"
                        ? "status available"
                        : "status sold"
                    }
                  >
                    {car.status}
                  </span>
                </div>

                <div className="car-content">
                  <div className="car-title">
                    <div>
                      <span className="brand">
                        {car.brand}
                      </span>

                      <h3>{car.model}</h3>
                    </div>
                  </div>

                  <div className="car-details">
                    <span>📅 {car.year}</span>

                    <span>
                      🛣️{" "}
                      {Number(
                        car.mileage
                      ).toLocaleString()}{" "}
                      km
                    </span>

                    <span>⛽ {car.fuel}</span>

                    <span>
                      ⚙️ {car.transmission}
                    </span>

                    <span>
                      🎨 {car.color}
                    </span>
                  </div>

                  <div className="car-footer">
                    <div>
                      <small>Price</small>

                      <strong>
                        ₹
                        {Number(
                          car.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div className="card-actions">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          editVehicle(car)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteVehicle(car.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="empty">
              <div>🚘</div>
              <h3>No vehicles found</h3>
              <p>
                Add a vehicle or change your
                search/filter.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;