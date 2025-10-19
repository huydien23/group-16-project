const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Import routes
const userRoutes = require("./router/user");

// Sử dụng routes
app.use("/users", userRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.json({
    message: "API Server đang chạy",
    endpoints: {
      users: {
        getAll: "GET /users",
        create: "POST /users",
      },
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
