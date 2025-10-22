const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} = require("../controllers/authController");
const { isAuthenticatedUser } = require("../middleware/auth");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Private routes (cần đăng nhập)
router.post("/logout", isAuthenticatedUser, logout);
router.get("/me", isAuthenticatedUser, getMe);
router.put("/updateprofile", isAuthenticatedUser, updateProfile);
router.put("/updatepassword", isAuthenticatedUser, updatePassword);

module.exports = router;
