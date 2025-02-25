// src/api/v1/hotel/uploads/employee_records/routes.js
const express = require("express");
const router = express.Router();
const { uploadFiles, deleteFileById, deleteAllFilesByUser, getAllFiles, uploadedById } = require("./controller");

const upload = require("../../../../../../global/config/Multer");
const uploadFields = upload.array("files[]", 10);

// Define HTTP events
router.get("/media_files/:id", uploadedById);
router.get("/media_files", getAllFiles);
router.post("/media_files", uploadFields, uploadFiles);
router.delete("/media_files/:id", deleteFileById);
router.delete("/media_files/user/:processed_by_id", deleteAllFilesByUser);

module.exports = router;