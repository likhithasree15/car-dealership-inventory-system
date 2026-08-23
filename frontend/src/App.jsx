import { useState } from "react";
import "./App.css";

const initialCars = [
  {
    id: 1,
    brand: "BMW",
    model: "3 Series",
    year: 2024,
    price: 4850000,
    mileage: 12000,
    fuel: "Petrol",
    transmission: "Automatic",
    color: "Black",
    status: "Available",
  },
  {
    id: 2,
    brand: "Toyota",
    model: "Fortuner",
    year: 2023,
    price: 3850000,
    mileage: 18000,
    fuel: "Diesel",
    transmission: "Automatic",
    color: "White",
    status: "Available",
  },
  {
    id: 3,
    brand: "Hyundai",
    model: "Creta",
    year: 2024,
    price: 1850000,
    mileage: 8500,
    fuel: "Petrol",
    transmission: "Automatic",
    color: "Silver",
    status: "Available",
  },
  {
    id: 4,
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2022,
    price: 6200000,
    mileage: 22000,
    fuel: "Petrol",
    transmission: "Automatic",
    color: "Blue",
    status: "Sold",
  },
];

function App() {
  const [cars, setCars] = useState(initialCars);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase());

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
    (total, car) => total + car.price,
    0
  );

  const deleteCar = (id) => {
    setCars(cars.filter((car) => car.id !== id));
  };

  return (
    <div className="app">

      {/* Sidebar */}
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
            <span>▦</span>
            Dashboard
          </a>

          <a className="nav-item">
            <span>🚘</span>
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
          <a className="nav-item">
            <span>⚙️</span>
            Settings
          </a>

          <div className="user-profile">
            <div className="avatar">LS</div>

            <div>
              <strong>Likhitha Sree</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main">

        {/* Header */}
        <header className="topbar">

          <div>
            <h1>Inventory Dashboard</h1>
            <p>Manage your dealership inventory and vehicles.</p>
          </div>

          <div className="header-actions">
            <button className="notification">🔔</button>

            <button className="add-btn">
              + Add Vehicle
            </button>
          </div>

        </header>

        {/* Statistics */}
        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon blue">🚘</div>

            <div>
              <span>Total Vehicles</span>
              <h2>{cars.length}</h2>
              <small className="positive">
                ↑ 12% this month
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
            <div className="stat-icon orange">💰</div>

            <div>
              <span>Inventory Value</span>
              <h2>
                ₹{(totalValue / 10000000).toFixed(2)} Cr
              </h2>
              <small className="positive">
                Current value
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📈</div>

            <div>
              <span>Sold Vehicles</span>
              <h2>{soldCars}</h2>
              <small className="positive">
                This inventory
              </small>
            </div>
          </div>

        </section>

        {/* Inventory Section */}
        <section className="inventory-section">

          <div className="section-header">

            <div>
              <h2>Vehicle Inventory</h2>
              <p>Browse and manage all vehicles.</p>
            </div>

            <button className="outline-btn">
              Export
            </button>

          </div>

          {/* Search and Filters */}
          <div className="filters">

            <div className="search-box">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search by brand or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Vehicles</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
            </select>

            <button className="filter-btn">
              ⚙ Filters
            </button>

          </div>

          {/* Cars */}
          <div className="car-grid">

            {filteredCars.map((car) => (

              <div className="car-card" key={car.id}>

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

                    <button className="more-btn">
                      ⋮
                    </button>

                  </div>

                  <div className="car-details">

                    <span>📅 {car.year}</span>

                    <span>
                      🛣 {car.mileage.toLocaleString()} km
                    </span>

                    <span>⛽ {car.fuel}</span>

                    <span>
                      ⚙ {car.transmission}
                    </span>

                  </div>

                  <div className="car-footer">

                    <div>
                      <small>Price</small>

                      <strong>
                        ₹{car.price.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="card-actions">

                      <button className="edit-btn">
                        Edit
                      </button>

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
              <div>🚘</div>
              <h3>No vehicles found</h3>
              <p>
                Try changing your search or filters.
              </p>
            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;