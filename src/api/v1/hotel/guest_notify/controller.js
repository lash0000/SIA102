/*
 *   This feature does have WebSocket API as stated:
 *  
 */

const mongoose = require('mongoose');
const { GuestNotification } = require('./model');

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

// GET ALL
const getAllNotify = async (req, res) => {
    try {
        await connectToDB();
        const logs = await GuestNotification.find()
            .populate('issued_by', '_id email_address guest_name username')
            .sort({ action_timestamp: -1 })
            .lean();

        res.status(200).json({
            data: logs
        });
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching notifications.'
        });
    }
};

// GET by ID
const getAllNotifyById = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Notification ID'
            });
        }

        // Fetch log
        const log = await GuestNotification.findById(id)
            .populate('issued_by', '_id email_address guest_name username') // Adjust fields as needed
            .lean();

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Notification logs not found'
            });
        }

        res.status(200).json({
            data: log
        });
    } catch (error) {
        console.error('Error fetching Notification logs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Notification logs'
        });
    }
};

// POST: Create a new notification
const addNotify = async (req, res) => {
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

        // Create new notification
        const newNotification = new GuestNotification({
            issued_by,
            action,
            action_description
        });

        // Save to database
        await newNotification.save();

        // Fetch populated version for response
        const populatedNotification = await GuestNotification.findById(newNotification._id)
            .populate('issued_by', '_id email_address guest_name username')
            .lean();

        res.status(201).json({
            data: populatedNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating notification'
        });
    }
};

module.exports = { getAllNotify, getAllNotifyById, addNotify };