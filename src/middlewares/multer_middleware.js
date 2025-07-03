import multer from "multer";
import fs from "fs";

const uploadPath = "public/temp";
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadPath);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

export const upload = multer({ storage });