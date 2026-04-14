import "dotenv/config";
import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticationMiddleware } from "./utils/auth.middleware.js";
import { userRouter } from "./routes/user.routes.js";
import { seatRouter } from "./routes/seat.routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

export const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "book-my-ticket",
  max: 20,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// Verify DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ DB connected");
    release();
  }
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Attach user to req if valid token exists (non-blocking)
app.use(authenticationMiddleware());

// Root — redirect based on auth status
app.get("/", (req, res) => {
  if (req.user) {
    return res.sendFile(__dirname + "/public/index.html");
  }
  res.redirect("/login");
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.use(userRouter);
app.use(seatRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => console.log(`🎬 ChaiCode Cinema running → http://localhost:${port}`));