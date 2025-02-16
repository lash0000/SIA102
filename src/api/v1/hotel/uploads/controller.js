const express = require('express');
const { createUploadthing, uploadFile } = require('uploadthing/express');

const uploadRouter = express.Router();

const upload = createUploadthing({
    apiKey: process.env.UPLOADTHING_TOKEN,
});

