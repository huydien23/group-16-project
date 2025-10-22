# 👥 Hệ Thống Quản Lý Người Dùng - Group 16 Project

## 📋 Mô Tả Dự Án

Hệ thống quản lý người dùng (User Management System) là một ứng dụng web full-stack cho phép quản lý thông tin người dùng với các chức năng CRUD (Create, Read, Update, Delete) hoàn chỉnh.

### ✨ Tính Năng Chính

- 📝 **Thêm người dùng mới** với thông tin: tên, email, số điện thoại, địa chỉ
- 📋 **Hiển thị danh sách người dùng** với giao diện thân thiện
- ✏️ **Cập nhật thông tin người dùng** đã có
- 🗑️ **Xóa người dùng** khỏi hệ thống
- 🔍 **Tìm kiếm và lọc người dùng**
- ✅ **Validation dữ liệu** đầu vào
- 🎨 **Giao diện responsive** - tương thích mọi thiết bị

---

## 🛠️ Công Nghệ Sử Dụng

### **Frontend**
- ⚛️ **React.js** - Thư viện UI
- 🎨 **CSS3** - Styling
- 📡 **Axios** - HTTP client
- ⚡ **Vite** - Build tool

### **Backend**
- 🟢 **Node.js** - Runtime environment
- 🚀 **Express.js** - Web framework
- 🍃 **MongoDB Atlas** - Cloud database
- 🔧 **Mongoose** - ODM (Object Data Modeling)
- 🔐 **dotenv** - Environment variables

### **Tools & DevOps**
- 🐙 **Git & GitHub** - Version control
- 📮 **Postman/Insomnia** - API testing
- 🔄 **Nodemon** - Auto-restart server

---

## 📁 Cấu Trúc Thư Mục

```
group-16-project/
│
├── backend/                    # Backend Node.js + Express
│   ├── controllers/           # Business logic
│   │   └── userController.js
│   ├── models/               # Database schemas
│   │   └── User.js
│   ├── router/               # API routes
│   │   └── user.js
│   ├── .env                  # Environment variables
│   ├── .env.example          # Example env file
│   ├── server.js             # Main server file
│   └── package.json
│
├── frontend/                  # Frontend React
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AddUser.jsx
│   │   │   ├── AddUser.css
│   │   │   ├── UserList.jsx
│   │   │   └── UserList.css
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
└── README.md                 # Tài liệu dự án

```

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Dự Án

### **Yêu Cầu Hệ Thống**

- Node.js >= 16.x
- npm hoặc yarn
- MongoDB Atlas account (hoặc MongoDB local)
- Git

### **Bước 1: Clone Repository**

```bash
git clone https://github.com/huydien23/group-16-project.git
cd group-16-project
```

### **Bước 2: Cài Đặt Backend**

```bash
cd backend
npm install
```

**Tạo file `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/userDB?retryWrites=true&w=majority
PORT=3000
```

**Chạy Backend:**
```bash
npm run dev
# Server sẽ chạy tại http://localhost:3000
```

### **Bước 3: Cài Đặt Frontend**

```bash
cd ../frontend
npm install
```

**Chạy Frontend:**
```bash
npm run dev
# App sẽ chạy tại http://localhost:5173
```

---

## 👥 Thành Viên Nhóm & Đóng Góp

### **Nhóm 16 - Phát Triển Ứng Dụng Web**

| Thành viên | Vai trò | Đóng góp chính |
|------------|---------|----------------|
| **Nguyễn Huy Điền** | Backend Developer | - Thiết kế và phát triển REST API<br>- Tích hợp MongoDB Atlas<br>- Xây dựng Controllers và Models<br>- Xử lý validation và error handling |
| **Dương Hoàng Duy** | Frontend Developer | - Phát triển giao diện React<br>- Tạo components (AddUser, UserList)<br>- Tích hợp API với frontend<br>- Responsive design và UX/UI |
| **Võ Trần Hoàng Bảo Khang** | Database Admin | - Thiết kế schema MongoDB<br>- Quản lý database<br>- Tối ưu hóa queries<br>- Backup và bảo mật database |


**© 2025 Group 16 - All Rights Reserved**