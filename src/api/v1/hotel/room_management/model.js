/*
*   This feature is for Room Management
*   This feature will be used for Employees Information Management and Web-based for (Guests)
*/

//src/api/v1/hotel/room_management/model.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');
// const { uploadFile, deleteFile } = require("../../../../../global/config/S3");
// const HotelMediaFiles = require('../uploads/room_management/model');

/*
In case of fullAddress here's suggested way of providing precise location
brgy -> https://psgc.gitlab.io/api/regions/{regionCode}/barangays/
city -> https://psgc.gitlab.io/api/regions/{regionCode}/cities-municipalities/
        https://psgc.gitlab.io/api/regions/{regionCode}/sub-municipalities/
province -> https://psgc.gitlab.io/api/provinces/

All of this should be dropdown UI based
*/

const fullAddress = new mongoose.Schema({
    street: { type: String, required: false },
    subdivision_village: { type: String, required: false },
    brgy: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    postalcode: { type: Number, required: false },
}, { _id: false });

const roomManagementSchema = new mongoose.Schema({
    hotel_type: { type: String, required: false },
    room_status: { type: String, required: true },
    slot_availability: { type: Number, required: true },
    location: { type: fullAddress, required: false },
    room_details: [{
        room_title: { type: String, required: true },
        // room_images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'room_media_files' }],
        room_images: [{ type: String, ref: 'room_media_files' }],
        room_availability: {
            adults: { type: Number,  required: true },
            children: { type: Number, required: true },
            infants: { type: Number, required: true }
        },
        initial_price_per_night: { type: Number, required: true },
        amenities_offer: [{
            amenities_name: { type: String, required: true },
            offer_details: { type: String, required: true }
        }],
    }],
    additional_details: { type: String, required: false },
    processed_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_employees_staff_records', required: true },
    generated_room_date_added: { 
        type: Date, 
        default: () => moment.tz('Asia/Manila').toDate() 
    }
});

// Create the RoomManagement model
const RoomManagement = mongoose.model('hotel_rooms', roomManagementSchema);

// Export RoomManagement and addRoomImages function
module.exports = { RoomManagement };
