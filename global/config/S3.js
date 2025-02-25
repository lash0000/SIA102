const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Upload files to S3 dynamically based on the folderName
const uploadFile = async (fileObject, folderName) => {
    try {
        const folder = folderName || 'random_folder';
        const fileName = `${folder}/${Date.now()}-${fileObject.originalname}`;
        const fileBuffer = fileObject.buffer;

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: fileObject.mimetype,
        };

        // Using multi-part upload if the file is large (e.g., >10MB)
        if (fileBuffer.length > 10485760) { // 10MB
            const multipartUploadParams = {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: fileObject.mimetype,
                PartSize: 10 * 1024 * 1024, // 10MB parts
                QueueSize: 5, // Number of parts to upload in parallel
            };
            const uploadResult = await s3.upload(multipartUploadParams).promise();
            console.log("Multipart S3 Upload Result:", uploadResult);
            return uploadResult;
        } else {
            // For smaller files, use a simple upload
            const uploadResult = await s3.upload(params).promise();
            console.log("S3 Upload Result:", uploadResult);
            return uploadResult;
        }
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }
};

// Create folder in S3
const createFolder = async (folderName) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `${folderName}/`,
    };

    try {
        await s3.putObject(params).promise();
        return `Folder ${folderName} created`;
    } catch (error) {
        console.error("Error creating folder in S3:", error);
        throw error;
    }
};

// Delete file from S3
const deleteFile = async (fileKey) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
    };

    try {
        const deleteResult = await s3.deleteObject(params).promise();
        console.log("S3 Delete Result:", deleteResult);
        return deleteResult;
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw error;
    }
};

// Generate Pre-signed URL for uploading a file to S3 (idk about this)
const generate_url = async (fileName, folderName) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `${folderName}/${fileName}`,
        Expires: 60 * 5,
        ContentType: 'application/octet-stream',
    };

    try {
        const url = await s3.getSignedUrlPromise('putObject', params);
        return url;
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        throw error;
    }
};

module.exports = { uploadFile, createFolder, deleteFile, generate_url };