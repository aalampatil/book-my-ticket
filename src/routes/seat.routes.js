import { Router } from "express";
import { pool } from "../index.js";

export const seatRouter = Router();

seatRouter.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats");
  console.log(result);
  res.send(result.rows);
});

seatRouter.put("/:id/:name", async (req, res) => {
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
})