import { Router } from "express";
import { pool } from "../index.js";
import bcrypt from "bcryptjs";
import { createUserToken } from "../utils/jwt-token.js";

export const userRouter = Router();

// ─── GET /register ─────────────────────────────────────────────────────────────
userRouter.get("/register", (req, res) => {
  // Already logged in? Go home.
  if (req.user) return res.redirect("/");
  res.render("register");
});

// ─── GET /login ────────────────────────────────────────────────────────────────
userRouter.get("/login", (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("login");
});

// ─── POST /register ────────────────────────────────────────────────────────────
userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Basic server-side validation
  if (!name?.trim() || !email?.trim() || !password) {
    return res.render("register", {
      error: "All fields are required.",
      name,
      email,
    });
  }

  if (password.length < 6) {
    return res.render("register", {
      error: "Password must be at least 6 characters.",
      name,
      email,
    });
  }

  try {
    // Check for duplicate email (case-insensitive)
    const existing = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existing.rowCount > 0) {
      return res.render("register", {
        error: "That email is already registered. Try logging in.",
        name,
        email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      "INSERT INTO users(first_name, email, password) VALUES($1, $2, $3) RETURNING id, email, first_name",
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const user = result.rows[0];

    // Auto-login after registration
    const token = createUserToken(user.email);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.redirect("/");
  } catch (err) {
    console.error("Register error:", err);
    res.render("register", {
      error: "Something went wrong. Please try again.",
      name,
      email,
    });
  }
});

// ─── POST /login ───────────────────────────────────────────────────────────────
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.render("login", {
      error: "Email and password are required.",
      email,
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password, first_name FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );

    if (result.rowCount === 0) {
      return res.render("login", {
        error: "Invalid email or password.",
        email,
      });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render("login", {
        error: "Invalid email or password.",
        email,
      });
    }

    const token = createUserToken(user.email);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", {
      error: "Server error. Please try again.",
      email,
    });
  }
});

// ─── GET /me — API endpoint to get current user info ───────────────────────────
userRouter.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ email: req.user.email });
});