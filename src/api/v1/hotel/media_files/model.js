const mongoose = require('mongoose');

// Schema definition for hotel media files
const hotelMediaFilesSchema = new mongoose.Schema({
    tracking_number: { type: Number, required: true, unique: true },
    media_images: [{
        images_file_name: { type: String, required: true },
        images_url: { type: String, required: true },
        uploaded_date: { type: Date, default: Date.now },
    }],
    media_files: [{
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
        uploaded_date: { type: Date, default: Date.now },
    }],
});

// Creating the model for the schema
const HotelMediaFiles = mongoose.model('hotel_media_files', hotelMediaFilesSchema);

module.exports = HotelMediaFiles;