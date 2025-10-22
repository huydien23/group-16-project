const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Kết nối MongoDB Atlas
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://huydien123:huydien123@groupdb.pe08z8z.mongodb.net/?retryWrites=true&w=majority&appName=groupDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Middleware
app.use(express.json());

// CORS Configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Import routes
const userRoutes = require("./router/user");

// Sử dụng routes
app.use("/users", userRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.json({
    message: "API Server đang chạy",
    endpoints: {
      users: {
        getAll: "GET /users",
        create: "POST /users",
      },
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
