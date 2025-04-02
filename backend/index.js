require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const redis = require("redis");

const app = express();

// Redis Client
const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.connect().then(() => console.log("✅ Connected to Redis"));


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

// Dummy Large Data Endpoint with Redis Caching
app.get("/api/dummy", async (req, res) => {
  try {
    const cacheData = await redisClient.get("largeData");
    if (cacheData) {
      console.log("✅ Serving from cache");
      return res.json(JSON.parse(cacheData));
    }

    console.log("🚀 Generating large dummy data...");
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 2 === 0 ? "admin" : "user",
    }));

    await redisClient.set("largeData", JSON.stringify(largeData), {
      EX: 60, // Cache expires in 60 seconds
    });

    res.json(largeData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Massive Data Endpoint with Deep Nesting and Redis Caching
app.get("/api/massive-data", async (req, res) => {
  try {
    const cacheData = await redisClient.get("massiveData");
    if (cacheData) {
      console.log("✅ Serving from cache");
      return res.json(JSON.parse(cacheData));
    }

    console.log("🚀 Generating massive dummy data with 1000 records...");
    const largeData = Array.from({ length: 2000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 2 === 0 ? "admin" : "user",
      address: {
        street: `Street ${i + 1}`,
        city: `City ${i % 100}`,
        country: "CountryX",
      },
      posts: Array.from({ length: 10 }, (_, j) => ({
        postId: j + 1,
        title: `Post Title ${j + 1} by User ${i + 1}`,
        content: `This is the content of post ${j + 1} by user ${i + 1}.`,
        comments: Array.from({ length: 5 }, (_, k) => ({
          commentId: k + 1,
          commenter: `Commenter ${k + 1}`,
          message: `Great post! (Comment ${k + 1})`,
        })),
      })),
    }));

    // Store the large data in Redis with a 5-minute expiry
    await redisClient.set("massiveData", JSON.stringify(largeData), {
      EX: 300,
    });

    // Send the large data as a response
    res.json(largeData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
const port = process.env.PORT || 5002;
console.log(
  "🔍 Loaded MongoDB URI:",
  process.env.MONGODB_URI ? "✅ Yes" : "❌ No, check .env file!"
);

// Export app for testing
module.exports = app;

// Only start the server if it's not being tested
if (require.main === module) {
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}

// Handle unexpected errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
