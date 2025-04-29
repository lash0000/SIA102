/*
*   This feature is for Booking Reservation Group (Guests).
*/


const BookingReservation_Queueing = require('./model');
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

//GET
const getAllBookingReservations = async (req, res) => {
    await connectToDB();

    try {
        const reservations = await BookingReservation_Queueing.find()
            .populate('reservation_queues') // Populate hotel_rooms details
            .populate('guest_issued_by')     // Populate hotel_guest_users details
            .exec();

        res.status(200).json({
            message: 'Successfully retrieved all booking reservations.',
            data: reservations
        });
    } catch (error) {
        console.error('Error fetching booking reservations:', error);
        res.status(500).json({
            message: 'Internal Server Error.'
        });
    }
};


// POST - Create a new Booking Reservation Queue
const createBookingReservation = async (req, res) => {
    await connectToDB();

    const { reservation_queues, guest_issued_by } = req.body;

    // Basic body field validation
    if (!reservation_queues || !guest_issued_by) {
        return res.status(400).json({
            message: 'Missing field: reservation_queues and guest_issued_by fields are required.'
        });
    }

    try {
        const newReservation = new BookingReservation_Queueing({
            reservation_queues,
            guest_issued_by
        });

        const savedReservation = await newReservation.save();
        
        res.status(201).json({
            message: 'Booking reservation created successfully.',
            data: savedReservation
        });
    } catch (error) {
        console.error('Error creating booking reservation:', error);

        // If error thrown from pre('save') with statusCode, use it
        const status = error.statusCode || 500;
        res.status(status).json({
            message: error.message || 'Internal Server Error.'
        });
    }
};


//PUT

//DELETE

module.exports = { getAllBookingReservations, createBookingReservation }