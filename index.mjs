import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

const pool = new pg.Pool({
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
app.use(express.static("public"))
app.set("view engine", "ejs");
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/register", (req, res) => {
  res.render("register")
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // check if email already exists...
  if (emailExists) {
    res.render('register', { error: 'Email already registered', name, email });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // your auth logic...
  if (failed) {
    res.render('login', { error: 'Invalid email or password', email });
  }
});

app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats");
  console.log(result)
  res.send(result.rows);
});



app.put("/:id/:name", async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;

    const conn = await pool.connect();

    await conn.query("BEGIN");

    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);
    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }

    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]);
    await conn.query("COMMIT");
    conn.release();
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.send(500);
  }
});

app.listen(port, () => console.log("http://localhost:" + port));
