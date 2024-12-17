// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid"); // UUID for token generation
const User = require("../models/User");
const { validateSignup } = require("../middlewares/validation");
const { protect } = require("../middlewares/authMiddleware");

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password (use app password if 2FA enabled)
  },
});

// Send Verification Email
const sendVerificationEmail = (userEmail, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/verify-email/${verificationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Please verify your email",
    html: `<p>Thank you for registering! Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">Verify Email</a>`,
  };

  return transporter.sendMail(mailOptions);
};


/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: User Signup
 *     description: Register a new user account and send a verification email.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: User already exists.
 *       500:
 *         description: Server error.
 */
// Signup Route
router.post("/signup", validateSignup, async (req, res) => {
  const { name, firstName, email, country, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4(); // Generate a unique token
    const tokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

    const user = new User({
      name,
      firstName,
      email,
      country,
      password: hashedPassword,
      verificationToken,
      tokenExpiry,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Email Verification Route
router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Error during email verification." });
  }
});


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User Login
 *     description: Login for existing users.
 *     tags:
 *       - Users
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
 *       400:
 *         description: Invalid email or password.
 *       500:
 *         description: Server error.
 */
// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // if (!user.isVerified) {
    //   return res
    //     .status(400)
    //     .json({ message: "Please verify your email before logging in." });
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
