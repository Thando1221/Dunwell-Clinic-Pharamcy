import express from "express";
import { poolPromise } from "../db.js";

const router = express.Router();

// GET stats (totals for cards)
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    const totalMedicinesResult = await pool
      .request()
      .query("SELECT COUNT(*) AS totalMedicines FROM Medication");

    const lowStockResult = await pool.request().query(`
      SELECT COUNT(*) AS lowStock
      FROM Medication
      WHERE Current_Stock < Minimum_Stock
    `);

    const expiringSoonResult = await pool.request().query(`
      SELECT COUNT(*) AS expiringSoon
      FROM Medication
      WHERE Expiry_Date BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE())
    `);

    res.json({
      totalMedicines: totalMedicinesResult.recordset[0].totalMedicines,
      lowStock: lowStockResult.recordset[0].lowStock,
      expiringSoon: expiringSoonResult.recordset[0].expiringSoon,
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// GET list of low stock items
router.get("/stock-alerts", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Medication_ID, Medication_Name, Current_Stock, Minimum_Stock
      FROM Medication
      WHERE Current_Stock < Minimum_Stock
      ORDER BY Current_Stock ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching stock alerts:", err);
    res.status(500).json({ error: "Failed to fetch stock alerts" });
  }
});

// GET list of expiring soon items (within 30 days)
router.get("/expiring-soon", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Medication_ID, Medication_Name, Expiry_Date, Current_Stock
      FROM Medication
      WHERE Expiry_Date BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE())
      ORDER BY Expiry_Date ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching expiring soon meds:", err);
    res.status(500).json({ error: "Failed to fetch expiring soon medications" });
  }
});

// 🕒 Recent Activity (resets daily)
router.get("/recent-activity", async (req, res) => {
  try {
    const pool = await poolPromise;

    // Grab the latest medicines by ID
    const recentMeds = await pool.request().query(`
      SELECT TOP 10 
        Medication_ID,
        Medication_Name,
        Current_Stock,
        Minimum_Stock,
        Expiry_Date,
        Supplier
      FROM Medication
      ORDER BY Medication_ID DESC
    `);

    // Get today's date string (yyyy-mm-dd)
    const today = new Date().toISOString().split("T")[0];

    // Build activities tagged with today's date
    const activity = recentMeds.recordset.map((row) => {
      let action;
      if (row.Current_Stock < row.Minimum_Stock) {
        action = `${row.Medication_Name} dispensed (stock now ${row.Current_Stock})`;
      } else {
        action = `${row.Medication_Name} added/updated`;
      }

      return {
        id: row.Medication_ID,
        name: row.Medication_Name,
        action,
        details: `Stock: ${row.Current_Stock}${
          row.Expiry_Date
            ? `, Expires: ${new Date(row.Expiry_Date).toLocaleDateString()}`
            : ""
        }`,
        supplier: row.Supplier || "Unknown",
        date: new Date(),
        dayKey: today, // ensures reset
      };
    });

    // ✅ Only return today's activities
    const filteredActivity = activity.filter((a) => a.dayKey === today);

    res.json(filteredActivity);
  } catch (err) {
    console.error("❌ Error fetching recent activity:", err);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

export default router;
