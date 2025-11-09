import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Firebase User Sync (works for both Google and Email/Password)
router.post("/firebase-sync", async (req, res) => {
  try {
    const { 
      firebaseToken, 
      firebaseUid, 
      email, 
      name, 
      avatar, 
      phone, 
      role, 
      institution, 
      location, 
      provider,
      emailVerified 
    } = req.body;

    // Check if user exists in MongoDB by email or firebaseUid
    let user = await User.findOne({ 
      $or: [
        { email },
        { firebaseUid }
      ]
    });

    if (!user) {
      // Create new user in MongoDB
      user = await User.create({
        firebaseUid,
        name: name || email.split('@')[0],
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        provider: provider || 'email',
        avatar: avatar || '👨‍⚕️',
        role: role || 'Researcher',
        phone: phone || '',
        institution: institution || '',
        location: location || '',
        emailVerified: emailVerified || false
      });
    } else {
      // Update existing user
      user.firebaseUid = firebaseUid;
      user.provider = provider || user.provider;
      user.emailVerified = emailVerified;
      
      // Update profile fields if provided
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (phone) user.phone = phone;
      if (role) user.role = role;
      if (institution) user.institution = institution;
      if (location) user.location = location;
      
      await user.save();
    }

    // Generate JWT token for MongoDB
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      institution: user.institution,
      location: user.location,
      avatar: user.avatar,
      provider: user.provider,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error("Firebase sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get user profile (protected route)
router.get("/profile", async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;