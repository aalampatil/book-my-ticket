import { Router } from "express";
import { pool } from "../index.js";
import bcrypt from "bcryptjs";
import { createUserToken } from "../utils/jwt-token.js";

export const userRouter = Router();


userRouter.get("/register", (req, res) => {
  res.render("register")
})

userRouter.get("/login", (req, res) => {
  res.render("login")
})

userRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rowCount > 0) {
      return res.render("register", {
        error: "Email already registered",
        name,
        email,
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      "INSERT INTO users(first_name, email, password) VALUES($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    console.log(user)

    // generate token
    const token = createUserToken(user.email);


    res.redirect("/")
  } catch (error) {
    throw error
  }

});


userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.render("login", {
        error: "Invalid email or password",
        email,
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render("login", {
        error: "Invalid email or password",
        email,
      });
    }

    const token = createUserToken(user.email);

    res.cookie("token", token, {
      httpOnly: true,     // 🔐 prevents JS access
      secure: false,      // true in production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.redirect("/")


  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});