// src/api/v1/hotel/uploads/employee_records/model.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Schema definition for hotel media files

// Notes:
// processed_by_id = Is for staff / manager who issued uploaded file.
// for_by = Where it should belongs (either Staff or Manager)

const hotelMediaFilesSchema = new mongoose.Schema({
    processed_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_employees_staff_records', required: true },
    for_by: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_employees_staff_records', required: false },
    media_files: [{
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
        uploaded_date: {
            type: Date,
            default: () => moment.tz('Asia/Manila').toDate()
        },
    }],
});

const HotelMediaFiles = mongoose.model('employee_media_files', hotelMediaFilesSchema);

module.exports = HotelMediaFiles;