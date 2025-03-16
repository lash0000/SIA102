// src/api/v1/hotel/uploads/queues/routes.js
const express = require("express");
const router = express.Router();
const { uploadFiles, deleteFileById, deleteAllFilesByUser, getAllFiles, uploadedById } = require("./controller");

const upload = require("../../../../../../global/config/Multer");
const uploadFields = upload.array("files[]", 10);

// Define HTTP events
router.get("/:id", uploadedById);
router.get("/", getAllFiles);
router.post("/", uploadFields, uploadFiles);
router.delete("/:id", deleteFileById);
router.delete("/user/:processed_by_id", deleteAllFilesByUser);

module.exports = router;