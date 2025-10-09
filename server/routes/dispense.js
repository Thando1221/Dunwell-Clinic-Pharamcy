import express from "express";
import { sql, poolPromise } from "../db.js";

const router = express.Router();

// Dispense medication
router.post("/", async (req, res) => {
  try {
    const { Medication_ID, Quantity, NurseID } = req.body;

    const pool = await poolPromise;

    // Reduce stock
    await pool.request()
      .input("Medication_ID", sql.Int, Medication_ID)
      .input("Quantity", sql.Int, Quantity)
      .query(`
        UPDATE Medication
        SET Current_Stock = Current_Stock - @Quantity
        WHERE Medication_ID = @Medication_ID
      `);

    // (Optional) Insert into a log/history table here

    res.json({ message: `✅ Dispensed ${Quantity} units successfully` });
  } catch (err) {
    console.error("Error dispensing medication:", err);
    res.status(500).json({ error: "❌ Failed to dispense medication" });
  }
});

// Get nurses (for dropdown)
router.get("/nurses", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT UserID, Name, Surname FROM Users WHERE UserRole = 'N'");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching nurses:", err);
    res.status(500).json({ error: "❌ Failed to fetch nurses" });
  }
});

export default router;
