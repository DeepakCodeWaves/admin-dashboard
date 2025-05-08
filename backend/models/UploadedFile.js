const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UploadedFile", uploadedFileSchema);
