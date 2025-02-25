const mongoose = require('mongoose');

// Schema definition for hotel media files
const hotelMediaFilesSchema = new mongoose.Schema({
    processed_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_employees_staff_records', required: true },
    media_files: [{
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
        uploaded_date: { type: Date, default: Date.now },
    }],
});

const HotelMediaFiles = mongoose.model('employee_media_files', hotelMediaFilesSchema);

module.exports = HotelMediaFiles;