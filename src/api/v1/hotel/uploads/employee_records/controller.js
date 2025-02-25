const { uploadFile, deleteFile } = require("../../../../../../global/config/S3");
// const { sendMessageToQueue } = require("../../../../../global/config/SQS");
const mongoose = require('mongoose');
const HotelMediaFiles = require("./model");

const DOCUMENT_MAX_SIZE = 524288000; // 500 MB limit

const connectToDB = async () => {
    try {
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// GET: (Issue the hotel_media_files schema)
const getAllFiles = async (req, res) => {
    try {
        await connectToDB();
        const media_files = await HotelMediaFiles.find();
        res.status(200).json(media_files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all files.', error });
    }
}

// GET: (Issue who uploaded file via _id)
const uploadedById = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;

        const employeeRecord = await HotelMediaFiles.find({ processed_by_id: id })
            .populate('processed_by_id', '_id employee_id email_address employee_name username')
            .exec();

        if (!employeeRecord || employeeRecord.length === 0) {
            return res.status(404).json({ message: 'No media files found for this employee.' });
        }

        res.status(200).json(employeeRecord);
    } catch (error) {
        console.error('Error fetching record data:', error);
        res.status(500).json({ message: 'Error fetching record data', error });
    }
};

// POST: (Issue file uploading)
const uploadFiles = async (req, res) => {
    try {
        await connectToDB();

        const processed_by_id = req.query.processed_by_id;
        const files = req.files;

        console.log("Received files:", files); 

        if (!processed_by_id || !files || files.length === 0) {
            return res.status(400).json({ error: "processed_by_id and files are required" });
        }

        const uploadedFiles = [];
        const uploadPromises = []; 

        const folderName = 'employee_records';

        for (const file of files) {
            if (file.size > DOCUMENT_MAX_SIZE) {
                return res.status(400).json({ error: `File ${file.originalname} exceeds the 100 MB limit.` });
            }

            console.log("Uploading file:", file.originalname);

            // Upload file to S3 in the 'employee_records' folder
            uploadPromises.push(
                uploadFile(file, folderName).then(uploadResult => {
                    console.log("S3 Upload Result:", uploadResult);

                    const fileMetadata = {
                        file_name: file.originalname,
                        file_url: uploadResult.Location,
                        uploaded_date: new Date(),
                    };

                    uploadedFiles.push(fileMetadata);
                    
                    const mediaFiles = new HotelMediaFiles({
                        processed_by_id: processed_by_id,
                        media_files: [fileMetadata],
                    });

                    return mediaFiles.save().then((savedData) => {
                        console.log("Saved file metadata to MongoDB:", savedData);
                    }).catch((error) => {
                        console.error("Error saving to MongoDB:", error);
                    });
                })
            );
        }

        await Promise.all(uploadPromises);

        // Send a successful response
        return res.status(200).json({
            message: "Files uploaded successfully",
            uploadedFiles: uploadedFiles,
        });
    } catch (error) {
        console.error("Error in file upload:", error);
        return res.status(500).json({ error: error.message });
    }
};

// DELETE: (Delete a specific file by _id)
const deleteFileById = async (req, res) => {
    try {
        const { id } = req.params;

        await connectToDB();
        const fileRecord = await HotelMediaFiles.findById(id);

        if (!fileRecord) {
            return res.status(404).json({ message: "File not found." });
        }

        const folderName = 'employee_records';
        const deletePromises = [];

        // Loop through the media_files array and delete all associated files
        fileRecord.media_files.forEach(file => {
            const fileKey = `${folderName}/${file.file_name}`;
            console.log("Deleting from S3:", fileKey);

            deletePromises.push(deleteFile(fileKey));
        });

        // Await all deletions from S3
        await Promise.all(deletePromises);
        await HotelMediaFiles.findByIdAndDelete(id);

        return res.status(200).json({
            message: "File deleted successfully from S3 and MongoDB",
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ error: error.message });
    }
};


// This now aligns to uploadFiles func.
const deleteAllFilesByUser = async (req, res) => {
    try {
        const { processed_by_id } = req.params;

        await connectToDB();
        const userFiles = await HotelMediaFiles.find({ processed_by_id });

        if (!userFiles || userFiles.length === 0) {
            return res.status(404).json({ message: "No files found for this user." });
        }

        const deletePromises = [];
        const folderName = 'employee_records';

        userFiles.forEach(fileRecord => {
            fileRecord.media_files.forEach(file => {
                const fileKey = `${folderName}/${file.file_name}`;
                const fullFileUrl = `${process.env.S3_BUCKET_URL}${fileKey}`;
                console.log("Deleting from S3:", fullFileUrl);

                // Push delete promises to delete files from S3
                deletePromises.push(deleteFile(fileKey));
            });
        });

        // Await all deletions from S3
        await Promise.all(deletePromises);

        // Now, delete the metadata from MongoDB for this user
        await HotelMediaFiles.deleteMany({ processed_by_id });

        return res.status(200).json({
            message: "All files deleted successfully from S3 and MongoDB",
        });
    } catch (error) {
        console.error("Error deleting all files:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllFiles, uploadFiles, uploadedById, deleteFileById, deleteAllFilesByUser }