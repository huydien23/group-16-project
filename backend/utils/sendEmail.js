const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Tạo transporter - Cấu hình email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME, // Email của bạn
        pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng (App Password)
      },
    });

    // Cấu hình nội dung email
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "User Management System"} <${
        process.env.EMAIL_USERNAME
      }>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
  }
};

module.exports = sendEmail;
