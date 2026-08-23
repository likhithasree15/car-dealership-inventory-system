# car-dealership-inventory-system
A full-stack web application for managing vehicle dealership inventory with secure user authentication and CRUD operations.

## Features

- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Protected inventory APIs
- Add new vehicles
- View vehicle inventory
- Search vehicles by brand or model
- Filter vehicles by availability
- Update vehicle information
- Delete vehicles
- Inventory statistics dashboard
- Responsive React interface
- MySQL database with Sequelize ORM

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- Sequelize
- JWT
- bcryptjs

### Database

- MySQL

## Project Structure

```text
car-dealership-inventory-system/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── server.js
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md