const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/auth");

// Route GET /users - Lấy danh sách tất cả users (ADMIN ONLY)
router.get("/", protect, authorizeRoles("admin"), getAllUsers);

// Route POST /users - Tạo user mới (ADMIN ONLY)
router.post("/", protect, authorizeRoles("admin"), createUser);

// Route PUT /users/:id - Cập nhật user theo ID (ADMIN ONLY)
router.put("/:id", protect, authorizeRoles("admin"), updateUser);

// Route DELETE /users/:id - Xóa user theo ID (ADMIN or Self)
router.delete("/:id", protect, deleteUser);

module.exports = router;
