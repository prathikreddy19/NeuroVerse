import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import inferenceRoutes from "./routes/inferenceRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";

dotenv.config();
connectDB();

const app = express();

// CORS Configuration - MUST come before routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Support both Vite and CRA
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/inference", inferenceRoutes);
app.use("/api/predict", predictRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));