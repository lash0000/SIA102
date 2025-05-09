const mongoose = require('mongoose');
const moment = require('moment-timezone');

const AttendanceHMS = new mongoose.Schema({
    employee_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_employees_staff_records',
        required: true
    },
    time_in: {
        type: Date,
        default: () => moment.tz('Asia/Manila').toDate()
    }
})

const Attendance_EIM = mongoose.model('attendance-log', AttendanceHMS);
module.exports = Attendance_EIM;