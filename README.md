# Car Dealership Inventory Management System

A full-stack Car Dealership Inventory Management System built using React, Node.js, Express, Sequelize and SQLite.

The system provides secure authentication, vehicle inventory management, searching, purchasing, restocking and admin controls.

## Features

### Authentication
- User registration
- User login
- Password hashing using bcryptjs
- JWT-based authentication
- Role-based authorization
- Admin and regular user roles

### Vehicle Inventory
- Add vehicles
- View available vehicles
- Search vehicles by make, model and category
- Filter vehicles by price range
- Update vehicle details
- Delete vehicles
- Track quantity in stock
- Purchase vehicles
- Restock vehicles
- Prevent purchase when quantity is zero

### Dashboard
- Total vehicles
- Available vehicles
- Inventory value
- Sold vehicles
- Search and filtering
- Responsive user interface

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Sequelize
- JWT
- bcryptjs

### Database

- SQLite

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login