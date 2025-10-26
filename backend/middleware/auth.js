const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware protect - kiểm tra JWT từ Authorization header
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiểm tra token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để truy cập",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here-12345"
    );

    // Lấy thông tin user từ database
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
      error: error.message,
    });
  }
};

// Kiểm tra user đã đăng nhập chưa (legacy - dùng cookies)
exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    // Kiểm tra token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để truy cập",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here-12345"
    );

    // Lấy thông tin user từ database
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
      error: error.message,
    });
  }
};

// Kiểm tra quyền admin
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập`,
      });
    }
    next();
  };
};
