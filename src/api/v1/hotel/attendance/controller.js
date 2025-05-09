const Attendance_EIM = require('./model');
const mongoose = require('mongoose');


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

const getAllAttendance = async (req, res) => {
    try {
        await connectToDB();
        const attendanceRecords = await Attendance_EIM
            .find()
            .populate('employee_info')
            .lean();
        
        if (!attendanceRecords.length) {
            return res.status(404).json({ message: 'No attendance records found' });
        }
        
        res.status(200).json({
            success: true,
            data: attendanceRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records',
            error: error.message
        });
    }
};

const createAttendance = async (req, res) => {
    try {
        await connectToDB();
        const { employee_info } = req.body;

        // Check if employee_info is provided
        if (!employee_info) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID is required'
            });
        }

        // Validate if employee_info is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(employee_info)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Employee ID format'
            });
        }

        // Verify employee exists
        const employeeExists = await mongoose.model('hotel_employees_staff_records').findById(employee_info);
        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Create new attendance record
        const newAttendance = await Attendance_EIM.create({
            employee_info
        });

        // Populate employee_info for response
        const populatedAttendance = await Attendance_EIM
            .findById(newAttendance._id)
            .populate('employee_info')
            .lean();

        res.status(201).json({
            success: true,
            data: populatedAttendance,
            message: 'Attendance recorded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating attendance record',
            error: error.message
        });
    }
};
module.exports = { getAllAttendance, createAttendance };