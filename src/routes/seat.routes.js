import { Router } from "express";
import { pool } from "../index.js";
import { restrictToAuthenticated } from "../utils/auth.middleware.js";

export const seatRouter = Router();

// ─── GET /seats — list all seats ───────────────────────────────────────────────
seatRouter.get("/seats", restrictToAuthenticated(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, isbooked, name FROM seats ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching seats:", err);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
});

// ─── PUT /:id/:name — book a seat ─────────────────────────────────────────────
// Associates the seat with the currently authenticated user's email as well.
seatRouter.put("/:id/:name", restrictToAuthenticated(), async (req, res) => {
  const seatId = parseInt(req.params.id, 10);
  const name = req.params.name?.trim();

  if (!Number.isInteger(seatId) || seatId < 1) {
    return res.status(400).json({ error: "Invalid seat ID" });
  }

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the row to prevent race conditions
    const check = await client.query(
      "SELECT id, isbooked FROM seats WHERE id = $1 FOR UPDATE",
      [seatId]
    );

    if (check.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Seat not found" });
    }

    if (check.rows[0].isbooked) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Seat already booked" });
    }

    // Book the seat — also store the booking user's email for auditing
    await client.query(
      "UPDATE seats SET isbooked = 1, name = $1, booked_by = $2 WHERE id = $3",
      [name, req.user.email, seatId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Seat ${seatId} booked for ${name}`,
      seatId,
      name,
      bookedBy: req.user.email,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error booking seat:", err);
    res.status(500).json({ error: "Failed to book seat" });
  } finally {
    client.release();
  }
});

// ─── GET /seats/my — seats booked by current user ─────────────────────────────
seatRouter.get("/seats/my", restrictToAuthenticated(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM seats WHERE isbooked = 1 AND booked_by = $1 ORDER BY id",
      [req.user.email]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user seats:", err);
    res.status(500).json({ error: "Failed to fetch your bookings" });
  }
});