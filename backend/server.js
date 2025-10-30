const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Kết nối MongoDB Atlas
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://huydien123:huydien123@groupdb.pe08z8z.mongodb.net/userDB?retryWrites=true&w=majority&appName=groupDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://group-16-project-one.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
        forgotPassword: "POST /api/auth/forgot-password",
        resetPassword: "PUT /api/auth/reset-password/:token",
        uploadAvatar: "POST /api/auth/upload-avatar",
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
