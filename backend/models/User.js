const mongoose = require('mongoose');

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ']
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;
