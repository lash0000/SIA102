const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.S3_BUCKET_NAME;  // Set this in your environment variables

// Upload files to S3
const uploadFile = async (fileObject) => {
    try {
        const fileName = `${Date.now()}-${fileObject.originalname}`;  // Unique file name
        const fileBuffer = fileObject.buffer; // Convert base64 to buffer

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: fileObject.mimetype,  // Corrected here to use `mimetype`
        };

        // Upload file to S3 using s3.upload
        const uploadResult = await s3.upload(params).promise(); // Corrected this line
        console.log("S3 Upload Result:", uploadResult);
        
        return uploadResult; // Returning the result of the S3 upload
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }
};

// Create a folder in S3 (this is optional, as S3 doesn't have traditional folders)
const createFolder = async (folderName) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `${folderName}/`,  // S3 treats any "folder" as a prefix for the file name
    };

    try {
        await s3.putObject(params).promise();
        return `Folder ${folderName} created`;
    } catch (error) {
        console.error("Error creating folder in S3:", error);
        throw error;
    }
};

module.exports = { uploadFile, createFolder };
