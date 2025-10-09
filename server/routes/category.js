import express from "express";
import { sql, poolPromise } from "../db.js";

const router = express.Router();

// Add category
router.post("/add", async (req, res) => {
  try {
    const { MedCategory_Name } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input("MedCategory_Name", sql.NVarChar(sql.MAX), MedCategory_Name)
      .query("INSERT INTO MedCategory (MedCategory_Name) VALUES (@MedCategory_Name)");

    res.json({ message: "✅ Category added successfully" });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "❌ Failed to add category" });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM MedCategory");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "❌ Failed to fetch categories" });
  }
});

export default router;
