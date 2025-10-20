import express from "express";
import { sql, poolPromise } from "../db.js";

const router = express.Router();

// ➕ Add medication
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

// 📋 Get all medications
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

// ✏️ Update medication
router.put("/:id", async (req, res) => {
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
    const { id } = req.params;

    const pool = await poolPromise;
    await pool
      .request()
      .input("Medication_ID", sql.Int, id)
      .input("Medication_Name", sql.NVarChar(50), Medication_Name)
      .input("MedCategory_ID", sql.Int, MedCategory_ID)
      .input("Current_Stock", sql.Int, Current_Stock)
      .input("Minimum_Stock", sql.Int, Minimum_Stock)
      .input("Expiry_Date", sql.Date, Expiry_Date)
      .input("Batch_No", sql.NVarChar(20), Batch_No)
      .input("Supplier", sql.NVarChar(50), Supplier)
      .input("Description", sql.NVarChar(50), Description)
      .query(`
        UPDATE Medication
        SET Medication_Name = @Medication_Name,
            MedCategory_ID = @MedCategory_ID,
            Current_Stock = @Current_Stock,
            Minimum_Stock = @Minimum_Stock,
            Expiry_Date = @Expiry_Date,
            Batch_No = @Batch_No,
            Supplier = @Supplier,
            Description = @Description
        WHERE Medication_ID = @Medication_ID
      `);

    res.json({ message: "✅ Medication updated successfully" });
  } catch (err) {
    console.error("Error updating medication:", err);
    res.status(500).json({ error: "❌ Failed to update medication" });
  }
});

// 🗑️ Delete medication
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request().input("Medication_ID", sql.Int, id)
      .query("DELETE FROM Medication WHERE Medication_ID = @Medication_ID");

    res.json({ message: "🗑️ Medication deleted successfully" });
  } catch (err) {
    console.error("Error deleting medication:", err);
    res.status(500).json({ error: "❌ Failed to delete medication" });
  }
});

export default router;
