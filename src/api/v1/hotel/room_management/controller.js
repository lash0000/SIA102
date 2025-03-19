/*
*   This feature is for Room Management
*   This feature will be used for Employees Information Management and Web-based for (Guests)
*/

//src/api/v1/hotel/room_management/controller.js

const mongoose = require('mongoose');
const { RoomManagement } = require('./model');
const { AuditLogs } = require('../audit_logs/model');
const requestIp = require('request-ip');
const platform = require('platform');

// Ensure proper database name usage in connection
const connectToDB = async () => {
    try {
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// GET METHOD
const getRooms = async (req, res) => {
    try {
        await connectToDB();

        const rooms = await RoomManagement.find()
            .populate('processed_by_id', 'employee_id email_address employee_name username employee_role')
            .populate('room_details.room_images')
            .exec();

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ message: "No rooms found." });
        }

        res.status(200).json({
            rooms: rooms
        });

    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
};

// POST METHOD

const createRoom = async (req, res) => {
    try {
        const {
            slot_availability,
            room_status,
            room_initial_price_per_night,
            room_details,
            processed_by_id
        } = req.body;

        if (!slot_availability || !room_status || !processed_by_id) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        await connectToDB();

        // First Assessment: Add Data

        const newRoom = new RoomManagement({
            slot_availability,
            room_status,
            room_initial_price_per_night,
            room_details,
            processed_by_id,
        });

        await newRoom.save();

        // Second Assessment: Audit Log

        const ipAddress = requestIp.getClientIp(req);
        const deviceInfo = getDeviceInfo();

        const auditLogData = {
            issued_by: processed_by_id,
            action: action,
            comments: comments,
            ip_address: ipAddress,
            device_info: deviceInfo,
        };

        const newAuditLog = new AuditLogs(auditLogData);
        await newAuditLog.save();

        res.status(201).json({
            message: "New Room added with audit log record successfully",
            room: newRoom
        });

    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: 'Error creating room', error: error.message });
    }
};

// HELPERS (THE REST)

function getDeviceInfo() {
    const info = platform;
    return {
        platform_name: info.name || 'Unidentified',
        platform_version: info.version || 'Unidentified',
        platform_product: info.product || 'Unidentified',
        platform_manufacturer: info.manufacturer || 'Unidentified',
        platform_layout: info.layout || 'Unidentified',
        platform_os: info.os.family || 'Unidentified',
        platform_description: info.description || 'Unidentified'
    };
}

module.exports = { getRooms, createRoom };