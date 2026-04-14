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

# 🎬 ChaiCode Cinema — Backend

Production-style seat booking backend built with **Express**, **PostgreSQL**, **JWT**, and **EJS**.

---

## Features

| Feature              | Details                                                                           |
| -------------------- | --------------------------------------------------------------------------------- |
| User Registration    | Email uniqueness check, bcrypt hashing (cost 12)                                  |
| User Login           | Cookie-based JWT auth (`httpOnly`, `sameSite: lax`)                               |
| Auth Middleware      | Soft (`authenticationMiddleware`) + Hard (`restrictToAuthenticated`)              |
| Seat Listing         | Protected GET `/seats` — returns all seats sorted by id                           |
| Seat Booking         | Protected PUT `/:id/:name` with row-level locking (`FOR UPDATE`) to prevent races |
| Duplicate prevention | Transactional check — returns 409 if already booked                               |
| User association     | Seats store `booked_by` (email) and `booked_at` (timestamp)                       |
| My bookings          | GET `/seats/my` — filtered by logged-in user's email                              |
| Current user API     | GET `/me` — returns `{ email }` for the logged-in user                            |
| Logout               | GET `/logout` — clears cookie and redirects to login                              |
| 401 vs Redirect      | API calls get JSON 401; browser navigations get 302 to `/login`                   |

---

## Project Structure

```
chaicode-cinema/
├── index.js                   # App entry point
├── package.json
├── .env.example               # Copy to .env and fill in values
├── db/
│   └── setup.sql              # Schema + seed + migration
├── routes/
│   ├── user.routes.js         # /register, /login, /me
│   └── seat.routes.js         # /seats, /:id/:name, /seats/my
├── utils/
│   ├── auth.middleware.js     # authenticationMiddleware, restrictToAuthenticated
│   └── jwt-token.js           # createUserToken, verifyUserToken
├── views/
│   ├── login.ejs
│   └── register.ejs
└── public/
    └── index.html             # Seat booking UI
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB credentials and a strong JWT_SECRET
```

### 3. Set up the database

```bash
# Create the DB if it doesn't exist
createdb sql_class_2_db

# Run the schema setup
npm run db:setup
# or: psql -d sql_class_2_db -f db/setup.sql
```

### 4. Start the server

```bash
# Development (auto-restart on change)
npm run dev

# Production
npm start
```

---

## API Reference

### Auth

| Method | Path        | Auth     | Description                |
| ------ | ----------- | -------- | -------------------------- |
| GET    | `/register` | Public   | Register page              |
| POST   | `/register` | Public   | Create account, auto-login |
| GET    | `/login`    | Public   | Login page                 |
| POST   | `/login`    | Public   | Login, sets cookie         |
| GET    | `/logout`   | Any      | Clears cookie, redirects   |
| GET    | `/me`       | Required | Returns `{ email }`        |

### Seats

| Method | Path         | Auth     | Description             |
| ------ | ------------ | -------- | ----------------------- |
| GET    | `/seats`     | Required | All seats ordered by id |
| PUT    | `/:id/:name` | Required | Book seat (race-safe)   |
| GET    | `/seats/my`  | Required | Current user's bookings |

---

## Key Design Decisions

### Why `FOR UPDATE`?

Row-level locking ensures that if two users click the same seat simultaneously, only one transaction succeeds. The other sees `rowCount = 0` on the locked-then-updated row and returns a 409.

### Why soft + hard middleware?

`authenticationMiddleware()` runs on every request and populates `req.user` if the token is valid — without blocking. `restrictToAuthenticated()` is applied per-route. This separation means you can easily add public pages later without restructuring.

### Why redirect vs 401?

The frontend sends `Accept: application/json` on fetch calls, so the middleware detects this and returns a JSON 401. Browser navigations (no `Accept: application/json`) get a 302 redirect to `/login`, which is the correct UX.

### bcrypt cost factor 12

Cost 10 is Express default and commonly used. Cost 12 adds ~4× more hashing time (still < 1s) — a good tradeoff for production, making brute-force attacks significantly slower.
