const moment = require('moment-timezone');
const requestIp = require('request-ip'); // import request-ip
const platform = require('platform');
const mongoose = require('mongoose');

// Define the platform schema for device info
const platformDevice = new mongoose.Schema({
    platform_name: { type: String },
    platform_version: { type: String },
    platform_product: { type: String },
    platform_manufacturer: { type: String },
    platform_layout: { type: String },
    platform_os: { type: String },
    platform_description: { type: String }
}, { _id: false });

// Define the main audit trail schema
const auditTrailLog = new mongoose.Schema({
    issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_employees_staff_records',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    action_timestamp: {
        type: Date,
        default: () => moment.tz('Asia/Manila').toDate()
    },
    ip_address: {
        type: String,
        required: true
    },
    device_info: {
        type: platformDevice,
        default: () => getDeviceInfo()
    },
    action_status: {
        type: String,
        required: false
    },
    comments: {
        type: String,
        required: true
    }
});

// Function to get Device Info (platform)
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

// Function to get IP address from the request object
async function getIpAddress(req) {
    try {
        const ip = requestIp.getClientIp(req);
        return ip || 'Unknown IP';
    } catch (error) {
        console.error("Error fetching IP address:", error);
        return 'Unknown IP';
    }
}

const AuditLogs = mongoose.model('audit_trail_logs', auditTrailLog);
module.exports = { AuditLogs, getIpAddress };