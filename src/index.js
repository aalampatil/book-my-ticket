import "dotenv/config";
import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { authenticationMiddleware, restrictToAuthenticated } from "./utils/auth.middleware.js";
import { userRouter } from "./routes/user.routes.js";
import { seatRouter } from "./routes/seat.routes.js";
import cookieParser from "cookie-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT

export const pool = new pg.Pool({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "postgres",
  database: "sql_class_2_db",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = new express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.set("view engine", "ejs");
app.use(cors());
app.use(cookieParser())
app.use(authenticationMiddleware())

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(userRouter)
app.use(seatRouter)

app.listen(port, () => console.log(`http://localhost:${port}`));
