const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes (không cần authentication)
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (cần authentication)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;