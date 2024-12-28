import multer from "multer";
import path from "path";

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Can be changed to a cloud storage service if needed
  },

  filename: function (req, file, cb) {
    // Use original file name or generate a unique name
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext; // You can modify this logic as needed
    cb(null, filename);
  }
});

// Configure multer with file size limit and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  }
});

export default upload;
