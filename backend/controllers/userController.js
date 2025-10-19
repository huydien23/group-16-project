// Mảng tạm để lưu trữ users
let users = [
  { id: 1, name: "Nguyễn Huy Điền", email: "dien@gmail.com" , phone: "0909090909" , address: "Cần Thơ, Việt Nam" },
  { id: 2, name: "Dương Hoàng Duy", email: "duy@gmail.com" , phone: "0376611234" , address: "Cần Thơ, Việt Nam" },
  { id: 3, name: "Võ Trần Hoàng Bảo Khang", email: "khang@gmail.com" , phone: "0909090909" , address: "Cần Thơ, Việt Nam" },
];

// GET /users - Lấy danh sách tất cả users
const getAllUsers = (req, res) => {
  try {
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách users",
      error: error.message,
    });
  }
};

// POST /users - Tạo user mới
const createUser = (req, res) => {
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
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại trong hệ thống",
      });
    }

    // Tạo user mới
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name,
      email,
      phone: phone || "",
      address: address || "",
    };

    users.push(newUser);

    res.status(201).json(newUser);
  } catch (error) {
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
