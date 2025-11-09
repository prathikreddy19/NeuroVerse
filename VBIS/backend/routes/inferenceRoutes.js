import express from "express";
const router = express.Router();

// Later you’ll store inference results here:
router.post("/save", async (req, res) => {
  try {
    const { userId, inputData, outputData } = req.body;
    // TODO: create inference model & save history
    res.json({ message: "Inference saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
