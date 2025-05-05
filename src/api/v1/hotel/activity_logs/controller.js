const mongoose = require('mongoose');
const { ActivityLogs } = require('./model');
const moment = require('moment-timezone');

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

// GET: Retrieve all activity logs
const getActivityLogs = async (req, res) => {
    try {
        await connectToDB();
        const logs = await ActivityLogs.find()
            .populate('issued_by', '_id email_address guest_name username')
            .sort({ action_timestamp: -1 })
            .lean();

        res.status(200).json({
            data: logs
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching activity logs'
        });
    }
};

// GET: Retrieve activity logs by issued_by ID
const getActivityLogById = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid issued_by ID'
            });
        }

        // Fetch logs where issued_by matches the provided ID
        const logs = await ActivityLogs.find({ issued_by: id })
            .populate('issued_by', '_id email_address guest_name username')
            .sort({ action_timestamp: -1 })
            .lean();

        if (!logs || logs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No activity logs found for this user'
            });
        }

        res.status(200).json({
            data: logs
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching activity logs'
        });
    }
};

// POST: Create a new activity log
const addActivity = async (req, res) => {
    try {
        await connectToDB();
        const { issued_by, action, action_description } = req.body;

        // Validate input
        if (!issued_by || !mongoose.isValidObjectId(issued_by)) {
            return res.status(400).json({
                success: false,
                message: 'Valid issued_by ID is required'
            });
        } else if (!action || typeof action !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Action is required and must be a string'
            });
        } else if (!action_description || typeof action_description !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Action description is required and must be a string'
            });
        }

        // Create new activity log
        const newLog = new ActivityLogs({
            issued_by,
            action,
            action_description,
            action_timestamp: moment.tz('Asia/Manila').toDate()
        });

        // Save to database
        await newLog.save();

        res.status(201).json({
            success: true,
            data: populatedLog
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating activity log'
        });
    }
};

module.exports = { getActivityLogs, getActivityLogById, addActivity };