// src/api/v1/hotel/uploads/queues/model.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');
// const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

// Notes:
// processed_by_id = Is for staff / manager who issued uploaded file.
// for_by = Where it should belongs (either Staff or Manager)
// This part will issue an auto scheduling of disappearing all data in every 2 or 5 minutes to uphold every uploads.


const hotelMediaFilesSchema = new mongoose.Schema({
    processed_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_employees_staff_records', required: true },
    media_files: [{
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
        uploaded_date: {
            type: Date,
            default: () => moment.tz('Asia/Manila').toDate()
        },
    }],
});

const HotelMediaFiles = mongoose.model('queue_uploads', hotelMediaFilesSchema);

module.exports = HotelMediaFiles;