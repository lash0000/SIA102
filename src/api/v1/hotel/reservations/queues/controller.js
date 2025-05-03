/*
*   This feature is for Booking Reservation Group (Guests).
*/


const BookingReservation_Queueing = require('./model');
const mongoose = require('mongoose');
const { RoomManagement } = require('../../room_management/model');
const GuestUser = require('../../guest_users/model');

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
const getAllBookQueue = async (req, res) => {
    await connectToDB();

    try {
        const reservations = await BookingReservation_Queueing.find()
            .populate('room_reservation', '_id room_status location room_details __v hotel_type')
            .populate('guest_issued_by')
            .exec();

        res.status(200).json({
            data: reservations
        });

    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            message: 'Failed to fetch reservations.',
            error: error.message
        });
    }
};


// POST - Create a new Booking Reservation Queue
const createBookQueue = async (req, res) => {
    await connectToDB();

    const { room_reservation, guest_issued_by, check_in, check_out, reservation_slot } = req.body;

    // Basic body field validation
    if (!room_reservation || !guest_issued_by) {
        return res.status(400).json({
            message: 'Missing field: room_reservation and guest_issued_by fields are required.'
        });
    } else if (!check_in || !check_out) {
        return res.status(400).json({
            message: 'Missing field: check_in and check_out are required.'
        });
    } else if (!mongoose.Types.ObjectId.isValid(room_reservation) || !mongoose.Types.ObjectId.isValid(guest_issued_by)) {
        return res.status(400).json({
            message: 'Invalid ObjectId format in room_reservation or guest_issued_by.'
        });
    }

    try {
        // Check if HotelRoom exists
        const roomExists = await RoomManagement.findById(room_reservation).lean();
        if (!roomExists) {
            return res.status(404).json({
                message: 'HotelRoom with the given ID not found.'
            });
        }

        // Check if GuestUser exists
        const guestExists = await GuestUser.findById(guest_issued_by).lean();
        if (!guestExists) {
            return res.status(404).json({
                message: 'GuestUser with the given ID not found.'
            });
        }

        // Create new reservation
        const newReservation = new BookingReservation_Queueing({
            room_reservation,
            guest_issued_by,
            check_in,
            check_out,
            reservation_slot
        });

        const savedReservation = await newReservation.save();

        res.status(201).json({
            message: 'This room was added successfully to your reservation queue.',
            data: savedReservation
        });

    } catch (error) {
        console.error('Error creating booking reservation:', error);
        const status = error.statusCode || 500;
        res.status(status).json({
            message: error.message || 'Internal Server Error.'
        });
    }
};

//PUT
const updateBookQueue = async (req, res) => {
    await connectToDB();

    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid reservation ID format.' });
    }

    try {
        const updated = await BookingReservation_Queueing.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Reservation not found.' });
        }

        res.status(200).json({
            message: 'Reservation updated successfully.',
            data: updated
        });

    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({
            message: 'Failed to update reservation.',
            error: error.message
        });
    }
};

//DELETE
const deleteBookQueue = async (req, res) => {
    await connectToDB();

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid reservation ID format.' });
    }

    try {
        const deleted = await BookingReservation_Queueing.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Reservation not found.' });
        }

        res.status(200).json({
            message: 'Reservation deleted successfully.',
            data: deleted
        });

    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({
            message: 'Failed to delete reservation.',
            error: error.message
        });
    }
};

module.exports = {
    getAllBookQueue,
    createBookQueue,
    updateBookQueue,
    deleteBookQueue
};
