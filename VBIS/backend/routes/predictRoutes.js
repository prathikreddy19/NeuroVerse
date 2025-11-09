import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// Save prediction history
router.post("/save", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Missing Authorization header" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { subjectId, parcellationType, clinicalNotes, metrics } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.history.push({ subjectId, parcellationType, clinicalNotes, metrics });
    await user.save();

    res.json({ message: "Prediction saved successfully" });
  } catch (err) {
    console.error("Prediction Save Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Fetch prediction history
router.get("/history", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Missing Authorization header" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ history: user.history });
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
