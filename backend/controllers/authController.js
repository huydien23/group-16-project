const User = require("../models/User");
const sendToken = require("../utils/jwtToken");

// @desc    Đăng ký user mới
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: tên, email và mật khẩu",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // Kiểm tra độ dài password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user", // Default là 'user', chỉ admin mới có thể tạo admin
    });

    // Trả về token
    sendToken(user, 201, res);
  } catch (error) {
    // Xử lý lỗi validation
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password có được nhập không
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Tìm user theo email (bao gồm cả password)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Trả về token
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Xóa cookie token
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng xuất",
      error: error.message,
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, avatar } = req.body;

    const newUserData = {
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone,
      address: address || req.user.address,
      avatar: avatar || req.user.avatar,
    };

    // Kiểm tra email mới có trùng với user khác không
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng bởi người dùng khác",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin",
      error: error.message,
    });
  }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới",
      });
    }

    // Lấy user với password
    const user = await User.findById(req.user.id).select("+password");

    // Kiểm tra mật khẩu cũ
    const isMatched = await user.comparePassword(oldPassword);

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cũ không đúng",
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    // Trả về token mới
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};
