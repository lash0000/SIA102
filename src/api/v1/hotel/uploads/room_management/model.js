// src/api/v1/hotel/uploads/room_management/model.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

// Notes:
// processed_by_id = Is for staff / manager who issued uploaded file.
// for_by = Where it should belongs (either Staff or Manager)

const hotelMediaFilesSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    processed_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_employees_staff_records', required: true },
    // room_number: { type: String, default: uuidv4, unique: true },
    media_files_id: { type: String, required: false },
    media_files: [{
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
        uploaded_date: {
            type: Date,
            default: () => moment.tz('Asia/Manila').toDate()
        },
    }],
});

const HotelMediaFiles = mongoose.model('room_media_files', hotelMediaFilesSchema);

module.exports = HotelMediaFiles;