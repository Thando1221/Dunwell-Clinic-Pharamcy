import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import medicationRoutes from "./routes/medication.js";
import categoryRoutes from "./routes/category.js";
import dispenseRoutes from "./routes/dispense.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import reportsRouter from "./routes/reports.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use("/api/medicine", medicationRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/dispense", dispenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRouter);

// ----------------------------------------------------
// ✅ Serve the frontend (React/Vite build) in production
// ----------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build folder will be at: ../dist  (after you run npm run build)
const frontendPath = path.join(__dirname, "../dist");
app.use(express.static(frontendPath));

// For React Router: send index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
// ----------------------------------------------------

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
