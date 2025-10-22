const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  try {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-12345';
    if (!secret || secret === '') {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign({ id: id.toString() }, secret, {
      expiresIn: '30d',
    });
  } catch (error) {
    console.error('JWT Generation Error:', error);
    throw error;
  }
};

// Register user
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: name, email, password'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    // Create user (password will be hashed by pre-save hook in model)
    console.log('Creating user with password length:', password.length);
    const user = await User.create({
      name,
      email,
      password, // Don't hash here, model will handle it
    });
    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Check if user exists and select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Check if user has password (not created from user management)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này chưa được thiết lập mật khẩu'
      });
    }

    // Check password
    console.log('Login attempt:', { email, hasPassword: !!user.password });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng xuất'
    });
  }
};

// Get current user (được gọi sau protect middleware)
const getMe = async (req, res) => {
  try {
    // User đã được verify và set bởi protect middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // User đã được verify và set bởi protect middleware
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin'
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật mật khẩu thành công'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật mật khẩu'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword
};