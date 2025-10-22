const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Kết nối MongoDB Atlas
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://huydien123:huydien123@groupdb.pe08z8z.mongodb.net/userDB?retryWrites=true&w=majority&appName=groupDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Import routes
const userRoutes = require("./router/user");
const authRoutes = require("./router/auth");

// Sử dụng routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server đang chạy",
    version: "2.0",
    endpoints: {
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        getMe: "GET /api/auth/me",
        updateProfile: "PUT /api/auth/updateprofile",
        updatePassword: "PUT /api/auth/updatepassword",
      },
      users: {
        getAll: "GET /api/users",
        create: "POST /api/users",
        update: "PUT /api/users/:id",
        delete: "DELETE /api/users/:id",
      },
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
