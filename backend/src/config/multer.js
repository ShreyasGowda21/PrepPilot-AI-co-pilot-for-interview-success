// Multer configuration for PDF resume uploads.
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('./env');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = config.uploads.dir;
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `resume-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    return cb(null, true);
  }
  return cb(new ApiError(400, 'Only PDF files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.uploads.maxFileSizeMB * 1024 * 1024 },
});

module.exports = upload;
