const multer = require("multer");

const storage = multer.memoryStorage();  // Store files in memory
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 524288000,
    },
});

module.exports = upload;