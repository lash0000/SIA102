/*
*   This feature is one of core functionalities.
*/

const mongoose = require('mongoose');
const AuditLogs = require('./model');

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

const getAllLogs = async (req, res) => {
    try {
        await connectToDB();
        const audit_log_data = await AuditLogs.find();
        res.status(200).json(audit_log_data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching audit record log data', error });
    }
}

// POST METHOD

const issueLogs = async (req, res) => {
    try {
        await connectToDB();
        const AuditLogData = req.body;

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

module.exports = { getAllLogs, issueLogs }