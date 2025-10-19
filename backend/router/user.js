const express = require("express");
const router = express.Router();
const { getAllUsers, createUser } = require("../controllers/userController");

// Route GET /users - Lấy danh sách tất cả users
router.get("/", getAllUsers);

// Route POST /users - Tạo user mới
router.post("/", createUser);

module.exports = router;
