import express from "express";
import { poolPromise } from "../db.js";

const router = express.Router();

// --- Full Reports Data ---
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    // 1. Medicines with categories
    const medicinesResult = await pool.request().query(`
      SELECT 
        m.Medication_ID AS id,
        m.Medication_Name AS name,
        c.MedCategory_Name AS category,
        m.Current_Stock AS stock,
        m.Minimum_Stock AS minStock,
        m.Expiry_Date AS expiryDate,
        m.Batch_No AS batchNumber,
        m.Supplier AS supplier
      FROM Medication m
      LEFT JOIN MedCategory c ON m.MedCategory_ID = c.MedCategory_ID
    `);

    const medicines = medicinesResult.recordset ?? [];

    // 2. Stats
    const totalMedicinesResult = await pool
      .request()
      .query("SELECT COUNT(*) AS totalMedicines FROM Medication");

    const lowStockResult = await pool.request().query(`
      SELECT COUNT(*) AS lowStock
      FROM Medication
      WHERE Current_Stock <= Minimum_Stock
    `);

    const expiringSoonResult = await pool.request().query(`
      SELECT COUNT(*) AS expiringSoon
      FROM Medication
      WHERE Expiry_Date BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE())
    `);

    const stats = {
      totalMedicines: totalMedicinesResult.recordset[0].totalMedicines,
      lowStockItems: lowStockResult.recordset[0].lowStock,
      expiringItems: expiringSoonResult.recordset[0].expiringSoon,
    };

    // 3. Categories distribution
    const categoryCounts = {};
    medicines.forEach((m) => {
      const category = m.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categories = Object.entries(categoryCounts).map(([name, count], idx) => ({
      name,
      value: count,
      color: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#00C49F"][idx % 5],
    }));

    // --- Mock trends (replace with Dispensed data later) ---
    const trends = [
      { name: "Week 1", stock: 450, dispensed: 120 },
      { name: "Week 2", stock: 430, dispensed: 98 },
      { name: "Week 3", stock: 465, dispensed: 145 },
      { name: "Week 4", stock: 420, dispensed: 167 },
    ];

    res.json({
      medicines,
      stats,
      categories,
      trends,
    });
  } catch (err) {
    console.error("❌ Error generating reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;
