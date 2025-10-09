import express from "express";
import { sql, poolPromise } from "../db.js";

const router = express.Router();

// Add medication
router.post("/add", async (req, res) => {
  try {
    const {
      Medication_Name,
      MedCategory_ID,
      Current_Stock,
      Minimum_Stock,
      Expiry_Date,
      Batch_No,
      Supplier,
      Description,
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input("Medication_Name", sql.NVarChar(50), Medication_Name)
      .input("MedCategory_ID", sql.Int, MedCategory_ID)
      .input("Current_Stock", sql.Int, Current_Stock)
      .input("Minimum_Stock", sql.Int, Minimum_Stock)
      .input("Expiry_Date", sql.Date, Expiry_Date)
      .input("Batch_No", sql.NVarChar(20), Batch_No)
      .input("Supplier", sql.NVarChar(50), Supplier)
      .input("Description", sql.NVarChar(50), Description)
      .query(`
        INSERT INTO Medication 
        (Medication_Name, MedCategory_ID, Current_Stock, Minimum_Stock, Expiry_Date, Batch_No, Supplier, Description)
        VALUES (@Medication_Name, @MedCategory_ID, @Current_Stock, @Minimum_Stock, @Expiry_Date, @Batch_No, @Supplier, @Description)
      `);

    res.json({ message: "✅ Medication added successfully" });
  } catch (err) {
    console.error("Error adding medication:", err);
    res.status(500).json({ error: "❌ Failed to add medication" });
  }
});

// Get all medications
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Medication");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching medications:", err);
    res.status(500).json({ error: "❌ Failed to fetch medications" });
  }
});

export default router;
