// Tạo JWT token và lưu vào cookie
const sendToken = (user, statusCode, res) => {
  const jwt = require("jsonwebtoken");

  // Tạo JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "mysecretkey123456789",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  // Options cho cookie
  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cookie chỉ có thể truy cập từ server
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
  };

  // Loại bỏ password khỏi response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: userResponse,
  });
};

module.exports = sendToken;
