require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Check if MongoDB URI is set properly
if (!process.env.MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI is not defined in the .env file.");
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    mongoose.set("strictQuery", false); // Prevent warnings
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use("/api/auth", authRoutes);

const port = process.env.PORT || 5002;
console.log(
  "🔍 Loaded MongoDB URI:",
  process.env.MONGODB_URI ? "✅ Yes" : "❌ No, check .env file!"
);

// Start Server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

// Handle unexpected errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
