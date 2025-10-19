const User = require('../models/User');

// GET /users - Lấy danh sách tất cả users từ MongoDB
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách users",
      error: error.message,
    });
  }
};

// POST /users - Tạo user mới trong MongoDB
const createUser = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: name và email",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại trong hệ thống",
      });
    }

    // Tạo user mới trong database
    const newUser = await User.create({
      name,
      email,
      phone: phone || '',
      address: address || ''
    });

    res.status(201).json({
      success: true,
      message: "Tạo user thành công",
      data: newUser
    });
  } catch (error) {
    // Xử lý lỗi validation của MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
};
