const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe, updateProfile, updatePassword } = require('../controllers/authController');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/updateprofile', updateProfile);
router.put('/updatepassword', updatePassword);

module.exports = router;