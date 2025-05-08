const express = require("express");
const multer = require("multer");
const path = require("path");
const UploadedFile = require('../models/UploadedFile')
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExt);
  },
});

const upload = multer({ storage });

// Upload Endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileData = new UploadedFile({
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await fileData.save();

    res.status(200).json({
      message: "File uploaded and saved to MongoDB",
      file: fileData,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving file metadata", error });
  }
});

module.exports = router;
