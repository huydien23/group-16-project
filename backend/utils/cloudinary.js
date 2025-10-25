const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload ảnh lên Cloudinary
const uploadImage = async (filePath, folder = "avatars") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      width: 300,
      height: 300,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
  }
};

// Xóa ảnh từ Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Không thể xóa ảnh.");
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
};
