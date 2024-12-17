const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// Admin Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is an admin
    const admin = await Admin.findOne({ user: user._id });
    if (!admin) {
      return res.status(403).json({ message: "Access denied. Not an admin" });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Add Admin (only for existing admins)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUser = await User.findById(userId);

    if (!adminUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current user is an admin
    const currentAdmin = await Admin.findOne({ user: req.user.id });
    if (!currentAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can add new admins" });
    }

    const newAdmin = new Admin({ user: adminUser._id });
    await newAdmin.save();

    res.status(201).json({ message: "Admin added successfully", newAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (Admin only)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const currentAdmin = await Admin.findOne({ user: req.user.id });
    if (!currentAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
