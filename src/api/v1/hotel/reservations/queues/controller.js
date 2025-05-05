/*
*   This feature is for Booking Reservation Group (Guests).
*/

const BookingReservation_Queueing = require('./model');
const mongoose = require('mongoose');
const { RoomManagement } = require('../../room_management/model');
const GuestUserAccount = require('../../guest_users/model');

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

// GET - Fetch all booking queues with nested population
const getAllBookQueue = async (req, res) => {
    await connectToDB();

    try {
        const reservations = await BookingReservation_Queueing.find()
            .populate({
                path: 'room_reservation',
                select: '_id room_status location room_details hotel_type',
                populate: {
                    path: 'room_details.room_images',
                    model: 'room_media_files', // Adjust to the actual model name for room_image
                }
            })
            .populate('guest_issued_by', '_id email_address guest_name username guest_role guest_id guest_user_date_added')
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

// GET - Fetch booking queues by guest ID
const getBookQueueByGuestId = async (req, res) => {
    await connectToDB();

    const { id } = req.params;

    try {
        // Find all reservations with the given reservation_id
        const reservations = await BookingReservation_Queueing.find({ reservation_id: id })
            .populate({
                path: 'room_reservation',
                select: '_id room_status location room_details hotel_type',
                populate: {
                    path: 'room_details.room_images',
                    model: 'room_media_files'
                }
            })
            .populate('guest_issued_by', '_id email_address guest_name username guest_role guest_id guest_user_date_added')
            .exec();

        if (!reservations || reservations.length === 0) {
            return res.status(404).json({
                message: 'No reservations found for this reservation_id.'
            });
        }

        res.status(200).json({
            data: reservations
        });

    } catch (error) {
        console.error('Error fetching reservations for reservation_id:', error);
        res.status(500).json({
            message: 'Failed to fetch reservations.',
            error: error.message
        });
    }
};

// POST - Create a new Booking Reservation Queue
const createBookQueue = async (req, res) => {
    await connectToDB();

    const { room_reservation, guest_issued_by, check_in, check_out, reservation_slot, initial_price_total } = req.body;

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
        const guestExists = await GuestUserAccount.findById(guest_issued_by).lean();
        if (!guestExists) {
            return res.status(404).json({
                message: 'GuestUser with the given ID not found.'
            });
        }

        // Check if a reservation with the same room_reservation and guest_issued_by already exists
        const existingReservation = await BookingReservation_Queueing.findOne({
            room_reservation,
            guest_issued_by
        }).lean();
        if (existingReservation) {
            return res.status(400).json({
                message: 'You have already reserved this room.'
            });
        }

        // Create new reservation with reservation_id set to guest_issued_by
        const newReservation = new BookingReservation_Queueing({
            reservation_id: guest_issued_by.toString(),
            room_reservation,
            guest_issued_by,
            check_in,
            check_out,
            reservation_slot,
            initial_price_total
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
// PUT - Update a booking queue
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

// DELETE - Delete a booking queue
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
    getBookQueueByGuestId,
    createBookQueue,
    updateBookQueue,
    deleteBookQueue
};