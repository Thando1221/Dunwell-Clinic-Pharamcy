import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import medicationRoutes from "./routes/medication.js";
import categoryRoutes from "./routes/category.js";
import dispenseRoutes from "./routes/dispense.js";
import authRoutes from "./routes/auth.js"; 
import dashboardRoutes from "./routes/dashboard.js"; // ✅ new dashboard route
import reportsRouter from "./routes/reports.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use("/api/medicine", medicationRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/dispense", dispenseRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/dashboard", dashboardRoutes); // ✅ mount dashboard endpoints
app.use("/api/reports", reportsRouter);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

