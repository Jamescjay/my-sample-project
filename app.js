const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const rateLimit = require("express-rate-limit");

// Import route files
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Import Swagger files
const userSwaggerDocs = require("./swagger/userSwagger");
const adminSwaggerDocs = require("./swagger/adminSwagger");

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rate-limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  headers: true,
});
app.use("/api", apiLimiter); // Apply rate-limiting to all API routes

// Swagger Documentation Routes
app.use("/api/docs/user", swaggerUI.serve, (req, res) => {
  swaggerUI.setup(userSwaggerDocs)(req, res);
});

app.use("/api/docs/admin", swaggerUI.serve, (req, res) => {
  swaggerUI.setup(adminSwaggerDocs)(req, res);
});

// API Routes
app.use("/api/users", userRoutes); // User routes
app.use("/api/posts", postRoutes); // Post routes
app.use("/api/comments", commentRoutes); // Comment routes
app.use("/api/admins", adminRoutes); // Admin routes

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
