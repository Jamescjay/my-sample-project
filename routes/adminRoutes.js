const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


/**
 * @swagger
 * /admins/login:
 *   post:
 *     summary: Admin Login
 *     description: Allows an admin user to log in.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       404:
 *         description: User not found.
 *       403:
 *         description: Access denied.
 *       500:
 *         description: Server error.
 */

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

/**
 * @swagger
 * /admins/add:
 *   post:
 *     summary: Add a new admin
 *     description: Allows an existing admin to add a new admin user.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []  # Enforces Bearer authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID to promote to admin.
 *     responses:
 *       201:
 *         description: Admin added successfully.
 *       403:
 *         description: Only admins can add new admins.
 *       500:
 *         description: Server error.
 */


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
