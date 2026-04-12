# 🎟️ BOOK-MY-TICKET

A seat booking REST API simulation built with **Node.js**, **Express**, and **PostgreSQL**. Supports user authentication with JWT and secure password hashing.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for running PostgreSQL)

### Installation

```bash
git clone url
cd booking-system
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=booking_db
JWT_SECRET=your_jwt_secret
```

---

## 🐘 Database Setup

### 1. Run a PostgreSQL container

```bash
docker run --name postgres-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=booking_db \
  -p 5432:5432 \
  -d postgres
```

### 2. Connect to the container and open psql

```bash
docker exec -it postgres-db psql -U postgres -d BOOK-MY-TICKET
```

### 3. Create the tables

```sql
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0
);

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 20);

CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    first_name VARCHAR(55) NOT NULL,
    email VARCHAR(322) UNIQUE NOT NULL,
    password VARCHAR(66),
    salt TEXT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP
);
```

---

## 🧑‍💻 Running the App

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## 📦 Tech Stack

| Package         | Purpose                       |
| --------------- | ----------------------------- |
| `express`       | Web framework                 |
| `pg`            | PostgreSQL client             |
| `bcryptjs`      | Password hashing              |
| `jsonwebtoken`  | JWT authentication            |
| `cookie-parser` | Cookie parsing middleware     |
| `cors`          | Cross-origin resource sharing |
| `dotenv`        | Environment variable loader   |
| `ejs`           | Templating engine             |

---

## 📁 Project Structure

```
BOOK-MY-TICKET-MAIN/
├── public/
│   └── index.html              # Static frontend entry point
├── src/
│   ├── controllers/            # Route handler logic
│   ├── routes/
│   │   ├── seat.routes.js      # Seat booking routes
│   │   └── user.routes.js      # User auth routes
│   ├── utils/
│   │   ├── api-error.js        # Custom API error class
│   │   ├── api-repsonse.js     # Standardized API response helper
│   │   ├── auth.middleware.js  # JWT authentication middleware
│   │   └── jwt-token.js        # JWT sign/verify helpers
│   └── index.js                # App entry point
├── views/
│   ├── login.ejs               # Login page template
│   └── register.ejs            # Register page template
├── .env                        # Environment variables (do not commit)
├── .gitignore
├── docker-compose.yml          # Docker Compose config for PostgreSQL
├── assignment_conn.session.sql # SQL session/assignment file
├── starter.mjs                 # Starter/seed script
├── package.json
└── README.md
```

---

## 📄 License

ISC
