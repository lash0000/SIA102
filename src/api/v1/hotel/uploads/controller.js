const { uploadFile } = require("../../../../../global/config/S3");
// const { sendMessageToQueue } = require("../../../../../global/config/SQS");
const mongoose = require('mongoose');
const HotelMediaFiles = require("./model");

const DOCUMENT_MAX_SIZE = 104857600; // 100 MB limit

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
        
        const employeeRecord = await HotelMediaFiles.findOne({ processed_by_id: id })
            .populate('processed_by_id');

        if (!employeeRecord) {
            return res.status(404).json({ message: 'Uploaded by employee record not found' });
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

        const processed_by_id = req.query.processed_by_id;  // processed_by_id from query parameters
        const files = req.files;  // files are stored in req.files by Multer

        console.log("Received files:", files); 

        if (!processed_by_id || !files || files.length === 0) {
            return res.status(400).json({ error: "processed_by_id and files are required" });
        }

        const uploadedFiles = [];
        const uploadPromises = []; 

        for (const file of files) {
            if (file.size > DOCUMENT_MAX_SIZE) {
                return res.status(400).json({ error: `File ${file.originalname} exceeds the 100 MB limit.` });
            }

            console.log("Uploading file:", file.originalname);

            // Upload file to S3 concurrently using Promise.all
            uploadPromises.push(
                uploadFile(file).then(uploadResult => {
                    console.log("S3 Upload Result:", uploadResult);

                    const fileMetadata = {
                        file_name: file.originalname,
                        file_url: uploadResult.Location,  // Store the file's location from S3
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

module.exports = { getAllFiles, uploadFiles, uploadedById }