// src/api/v1/hotel/routes.js
const express = require("express");
const router = express.Router();
const { uploadFiles, getAllFiles, uploadedById } = require("./controller");

const upload = require("../../../../../global/config/Multer");
const uploadFields = upload.array("files[]", 10);

// Define HTTP events
router.get("/media_files/:id", uploadedById);
router.get("/media_files", getAllFiles);
router.post("/media_files", uploadFields, uploadFiles);

module.exports = router;