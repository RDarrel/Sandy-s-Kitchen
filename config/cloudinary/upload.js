const multer = require("multer");

const storage = multer.memoryStorage(); // store in memory, then upload to Cloudinary manually

const upload = multer({ storage });

module.exports = upload;
