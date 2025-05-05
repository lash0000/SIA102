/*
*   This feature is one of core functionalities.
*/

const mongoose = require('mongoose');
const { AuditLogs } = require('./model');
const StaffAccount = require('../staff_accounts/model');
const requestIp = require('request-ip');
const platform = require('platform');

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

// GET ALL
const getAllLogs = async (req, res) => {
    try {
        await connectToDB();

        const audit_log_data = await AuditLogs.find()
            .populate({
                path: 'issued_by',
                select: 'employee_id email_address employee_name username employee_role'
            })
            .exec();

        res.status(200).json(audit_log_data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching audit record log data', error });
    }
};

// POST METHOD for creating audit logs
const issueLogs = async (req, res) => {
    try {
        await connectToDB();

        // Get the IP address using request-ip
        const ipAddress = requestIp.getClientIp(req);

        // Get device info from platform.js
        const deviceInfo = getDeviceInfo();

        // Prepare audit log data
        const AuditLogData = {
            issued_by: req.body.processed_by_id,
            action: req.body.action,
            comments: req.body.comments,
            ip_address: ipAddress,
            device_info: deviceInfo,
        };

        // Create a new audit log entry
        const newAuditLog = new AuditLogs(AuditLogData);
        await newAuditLog.save();

        res.status(201).json({ message: 'New audit log added successfully', record: newAuditLog });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
            }));
            res.status(400).json({ message: 'Validation Error', errors: validationErrors });
        } else {
            res.status(500).json({ message: 'Error adding employee record', error: error.message });
        }
    }
}

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

module.exports = { getAllLogs, issueLogs }