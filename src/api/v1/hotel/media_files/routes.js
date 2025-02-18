const express = require("express");
const router = express.Router();

const {
    CreateFiles,
} = require("./controller");

const upload = require("../../../../../global/config/Multer");
const uploadFields = upload.array("files", 10);

router.post("/media_files", uploadFields, RequireAuth, CreateFiles);

module.exports = router;