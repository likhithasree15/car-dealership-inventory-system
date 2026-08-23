import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

function Auth({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const url = register
      ? `${API}/auth/register`
      : `${API}/auth/login`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    if (register) {
      setMessage("Registration successful. Please login.");
      setRegister(false);
      setForm({ name: "", email: "", password: "" });
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-icon">🚗</div>

        <h1>AutoHub</h1>
        <p>Car Dealership Inventory System</p>

        <h2>{register ? "Create Account" : "Login"}</h2>

        <form onSubmit={submit}>
          {register && (
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <button className="add-btn">
            {register ? "Register" : "Login"}
          </button>
        </form>

        {message && <p>{message}</p>}

        <button
          className="outline-btn"
          onClick={() => {
            setRegister(!register);
            setMessage("");
          }}
        >
          {register
            ? "Already have an account? Login"
            : "Create new account"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  const [vehicle, setVehicle] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    fuel: "Petrol",
    transmission: "Automatic",
    color: "",
    status: "Available",
  });

  const token = localStorage.getItem("token");

  const loadCars = async () => {
    const response = await fetch(`${API}/vehicles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setCars(await response.json());
    }
  };

  useEffect(() => {
    if (user) loadCars();
  }, [user]);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const addVehicle = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...vehicle,
        year: Number(vehicle.year),
        price: Number(vehicle.price),
        mileage: Number(vehicle.mileage),
      }),
    });

    if (response.ok) {
      setShowAdd(false);

      setVehicle({
        brand: "",
        model: "",
        year: "",
        price: "",
        mileage: "",
        fuel: "Petrol",
        transmission: "Automatic",
        color: "",
        status: "Available",
      });

      loadCars();
    }
  };

  const deleteCar = async (id) => {
    await fetch(`${API}/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadCars();
  };

  const filteredCars = cars.filter((car) => {
    const text = `${car.brand} ${car.model}`.toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (filter === "All" || car.status === filter)
    );
  });

  const availableCars = cars.filter(
    (car) => car.status === "Available"
  ).length;

  const soldCars = cars.filter(
    (car) => car.status === "Sold"
  ).length;

  const totalValue = cars.reduce(
    (sum, car) => sum + Number(car.price),
    0
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

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
          <a className="nav-item active">
            <span>◆</span>
            Dashboard
          </a>

          <a className="nav-item">
            <span>🚙</span>
            Inventory
          </a>

          <a className="nav-item">
            <span>👥</span>
            Customers
          </a>

          <a className="nav-item">
            <span>📋</span>
            Sales
          </a>

          <a className="nav-item">
            <span>📊</span>
            Reports
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={logout}>
            <span>↪</span>
            Logout
          </button>

          <div className="user-profile">
            <div className="avatar">
              {user.name?.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Inventory Dashboard</h1>
            <p>
              Manage your dealership inventory and vehicles.
            </p>
          </div>

          <div className="header-actions">
            <button className="notification">🔔</button>

            <button
              className="add-btn"
              onClick={() => setShowAdd(true)}
            >
              + Add Vehicle
            </button>
          </div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">🚙</div>
            <div>
              <span>Total Vehicles</span>
              <h2>{cars.length}</h2>
              <small className="positive">Current inventory</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Available</span>
              <h2>{availableCars}</h2>
              <small className="positive">Ready for sale</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">💰</div>
            <div>
              <span>Inventory Value</span>
              <h2>
                ₹{(totalValue / 10000000).toFixed(2)} Cr
              </h2>
              <small className="positive">Current value</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📈</div>
            <div>
              <span>Sold Vehicles</span>
              <h2>{soldCars}</h2>
              <small className="positive">This inventory</small>
            </div>
          </div>
        </section>

        <section className="inventory-section">
          <div className="section-header">
            <div>
              <h2>Vehicle Inventory</h2>
              <p>Browse and manage all vehicles.</p>
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>🔍</span>

              <input
                placeholder="Search by brand or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Available</option>
              <option>Sold</option>
            </select>
          </div>

          <div className="car-grid">
            {filteredCars.map((car) => (
              <div className="car-card" key={car.id}>
                <div className="car-image">
                  <div className="car-placeholder">🚙</div>

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
                      <span className="brand">{car.brand}</span>
                      <h3>{car.model}</h3>
                    </div>
                  </div>

                  <div className="car-details">
                    <span>📅 {car.year}</span>
                    <span>
                      🛣 {Number(car.mileage).toLocaleString()} km
                    </span>
                    <span>⛽ {car.fuel}</span>
                    <span>⚙ {car.transmission}</span>
                  </div>

                  <div className="car-footer">
                    <div>
                      <small>Price</small>
                      <strong>
                        ₹{Number(car.price).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="card-actions">
                      <button
                        className="delete-btn"
                        onClick={() => deleteCar(car.id)}
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
              <div>🚙</div>
              <h3>No vehicles found</h3>
              <p>Add a vehicle to your inventory.</p>
            </div>
          )}
        </section>
      </main>

      {showAdd && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Vehicle</h2>

            <form onSubmit={addVehicle}>
              <input
                placeholder="Brand"
                value={vehicle.brand}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    brand: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Model"
                value={vehicle.model}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    model: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Year"
                value={vehicle.year}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    year: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={vehicle.price}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    price: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Mileage"
                value={vehicle.mileage}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    mileage: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Color"
                value={vehicle.color}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    color: e.target.value,
                  })
                }
                required
              />

              <select
                value={vehicle.fuel}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    fuel: e.target.value,
                  })
                }
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>

              <select
                value={vehicle.transmission}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    transmission: e.target.value,
                  })
                }
              >
                <option>Automatic</option>
                <option>Manual</option>
              </select>

              <select
                value={vehicle.status}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    status: e.target.value,
                  })
                }
              >
                <option>Available</option>
                <option>Sold</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>

                <button className="add-btn">
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;