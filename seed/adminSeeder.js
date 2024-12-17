require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

const seedAdmin = async () => {
  try {
    await connectDB();
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Default",
      firstName: "Admin",
      email: "admin@gmail.com",
      country: "Global",
      password: hashedPassword,
      isVerified: true,
      role: "admin",
    });

    await admin.save();

    // After saving the user, add them to the Admin collection
    const adminEntry = new Admin({
      user: admin._id, // Reference the admin user by ID
    });

    await adminEntry.save();

    console.log("Admin user seeded successfully!");
  } catch (err) {
    console.error("Error seeding admin:", err.message);
  } finally {
    process.exit();
  }
};

seedAdmin();
