const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Route GET /users - Lấy danh sách tất cả users
router.get("/", getAllUsers);

// Route POST /users - Tạo user mới
router.post("/", createUser);

// Route PUT /users/:id - Cập nhật user theo ID
router.put("/:id", updateUser);

// Route DELETE /users/:id - Xóa user theo ID
router.delete("/:id", deleteUser);

module.exports = router;
