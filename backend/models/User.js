const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập email hợp lệ",
      ],
    },
    password: {
      type: String,
      required: false, // Không bắt buộc để hỗ trợ tạo user từ user management
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false, // Không trả về password khi query
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    avatarPublicId: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Mã hóa password trước khi lưu
userSchema.pre("save", async function (next) {
  // Chỉ hash nếu password được modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password với cost factor 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method so sánh password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo và hash reset password token
userSchema.methods.getResetPasswordToken = function () {
  // Tạo token ngẫu nhiên
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token và lưu vào database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set thời gian hết hạn token (10 phút)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Trả về token chưa hash để gửi qua email
};

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;
