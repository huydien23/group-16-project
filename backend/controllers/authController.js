const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const multer = require("multer");
const path = require("path");

// Cấu hình Multer để upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)"));
    }
  },
}).single("avatar");

// Generate JWT Token
const generateToken = (id) => {
  try {
    const secret =
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here-12345";
    if (!secret || secret === "") {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign({ id: id.toString() }, secret, {
      expiresIn: "30d",
    });
  } catch (error) {
    console.error("JWT Generation Error:", error);
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
        message: "Vui lòng cung cấp đầy đủ thông tin: name, email, password",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // Create user (password will be hashed by pre-save hook in model)
    console.log("Creating user with password length:", password.length);
    const user = await User.create({
      name,
      email,
      password, // Don't hash here, model will handle it
    });
    console.log("User created successfully:", user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || "user",
          phone: user.phone || "",
          address: user.address || "",
          avatar: user.avatar || "",
        },
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
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
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Check if user exists and select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check if user has password (not created from user management)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản này chưa được thiết lập mật khẩu",
      });
    }

    // Check password
    console.log("Login attempt:", { email, hasPassword: !!user.password });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || "user",
          phone: user.phone || "",
          address: user.address || "",
          avatar: user.avatar || "",
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng xuất",
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
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "user",
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
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
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "user",
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin",
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
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
      message: "Cập nhật mật khẩu thành công",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật mật khẩu",
    });
  }
};

// Forgot Password - Gửi email reset password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với email này",
      });
    }

    // Tạo reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Tạo URL reset password
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    // Nội dung email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Đặt lại mật khẩu</a>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 20px;">Link này sẽ hết hạn sau 10 phút.</p>
        <p style="color: #999; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Đặt lại mật khẩu - User Management System",
        html: message,
      });

      res.status(200).json({
        success: true,
        message: "Email đặt lại mật khẩu đã được gửi",
        data: {
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error sending email:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Không thể gửi email. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý yêu cầu",
    });
  }
};

// Reset Password - Đặt lại mật khẩu với token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu mới",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Hash token để so sánh với database
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Đặt mật khẩu mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Tạo token mới để tự động đăng nhập
    const authToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token: authToken,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt lại mật khẩu",
    });
  }
};

// Upload Avatar - Upload ảnh đại diện lên Cloudinary
const uploadAvatar = async (req, res) => {
  try {
    // Sử dụng multer middleware
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "Lỗi upload file: " + err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn file ảnh",
        });
      }

      try {
        // Upload lên Cloudinary
        const result = await uploadImage(req.file.path, "user-avatars");

        // Cập nhật avatar trong database
        const user = await User.findById(req.user._id);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy người dùng",
          });
        }

        // Xóa avatar cũ trên Cloudinary nếu có
        if (user.avatarPublicId) {
          try {
            await deleteImage(user.avatarPublicId);
          } catch (error) {
            console.log("Error deleting old avatar:", error);
          }
        }

        // Cập nhật avatar mới
        user.avatar = result.url;
        user.avatarPublicId = result.public_id;
        await user.save();

        // Xóa file tạm trong thư mục uploads
        const fs = require("fs");
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          success: true,
          message: "Upload avatar thành công",
          data: {
            avatar: user.avatar,
            avatarPublicId: user.avatarPublicId,
          },
        });
      } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Xóa file tạm nếu có lỗi
        if (req.file && req.file.path) {
          const fs = require("fs");
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.log("Error deleting temp file:", e);
          }
        }

        res.status(500).json({
          success: false,
          message: "Lỗi khi upload ảnh lên cloud",
        });
      }
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi upload avatar",
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
};
