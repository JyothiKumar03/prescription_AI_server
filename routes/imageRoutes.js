const express = require("express");
const router = express.Router();
const { uploadFile, handleFileUpload } = require("../controller/imagehandle");

router.post("/upload", handleFileUpload, uploadFile);

module.exports = router;
