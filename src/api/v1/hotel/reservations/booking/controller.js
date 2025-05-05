/*
 *   This feature is for Booking Reservation Group (Guests).
 */

const mongoose = require('mongoose');
const Booking_Reservation = require('./model');
const { RoomManagement } = require('../../room_management/model');
const BookingReservation_Queueing = require('../queues/model');
const { Send } = require('../../../../../../global/config/NodeMailer');
const { ActivityLogs } = require('../../activity_logs/model'); 

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

// GET: Retrieve all bookings with populated fields
const getAllBookings = async (req, res) => {
    try {
        // Ensure database connection
        await connectToDB();

        // Fetch all bookings with populated fields
        const bookings = await Booking_Reservation.find()
            .sort({ booking_date_added: -1 })
            .populate({
                path: 'reservation_room',
                select: '-processed_by_id' // Exclude processed_by_id
            })
            .populate('booking_issued_by'); // Include all fields

        // Respond with success
        res.status(200).json({
            data: bookings
        });
    } catch (error) {
        console.error('Error in getAllBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving bookings',
            error: error.message
        });
    } finally {
        await mongoose.connection.close();
    }
};

// GET: Retrieve a single booking by ID with populated fields (Applicable for per user records)
const getBookingsById = async (req, res) => {
    try {
        await connectToDB();

        const { id } = req.params;

        // Validate the user ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Fetch all bookings where booking_issued_by matches user ID
        const bookings = await Booking_Reservation.find({ booking_issued_by: id })
            .populate({
                path: 'reservation_room',
                select: '-processed_by_id',
                populate: {
                    path: 'room_details.room_images',
                    model: 'room_media_files'
                }
            })
            .populate('booking_issued_by');

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bookings found for this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bookings retrieved successfully',
            data: bookings
        });
    } catch (error) {
        console.error('Error in getBookingsByUserId:', error);
        res.status(500).json({
            message: 'Server error while retrieving bookings',
            error: error.message
        });
    } finally {
        await mongoose.connection.close();
    }
};

// GET: Retrieve a single booking by its main _id (Applicable for receipt retrieval)
const getBookById = async (req, res) => {
    try {
        await connectToDB();

        const { id } = req.params;

        // Validate the booking ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        // Fetch the booking by its main _id
        const booking = await Booking_Reservation.findById(id)
            .populate({
                path: 'reservation_room',
                select: '-processed_by_id',
                populate: {
                    path: 'room_details.room_images',
                    model: 'room_media_files'
                }
            })
            .populate('booking_issued_by');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking retrieved for receipt successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error in getBookById:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving booking',
            error: error.message
        });
    } finally {
        await mongoose.connection.close();
    }
};

// POST: Add a new booking reservation (Applicable for Pay thru Counter as Mode of Payment)
const addBookReserve = async (req, res) => {
    try {
        // Ensure database connection
        await connectToDB();

        // Destructure and validate request body
        const {
            reservation_room,
            booking_issued_by,
            contact_information,
            mode_of_payment,
            receipt_record
        } = req.body;

        // Validate required fields
        if (!reservation_room || !Array.isArray(reservation_room) || reservation_room.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'reservation_room must be a non-empty array of room IDs'
            });
        }
        if (!booking_issued_by || !mode_of_payment || !receipt_record) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: booking_issued_by, mode_of_payment, or receipt_record'
            });
        }
        if (!contact_information || typeof contact_information !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Contact information is required and must be an object'
            });
        }

        const { email_address, contact_first_name, contact_last_name, contact_name_suffix } = contact_information;
        if (!email_address || !contact_first_name || !contact_last_name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required contact information fields: email_address, contact_first_name, or contact_last_name'
            });
        }

        if (!receipt_record.order_reservation_total || receipt_record.order_reservation_total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing order_reservation_total in receipt_record'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(booking_issued_by)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking_issued_by ID format'
            });
        }

        // Validate all room IDs in the reservation_room array
        for (const roomId of reservation_room) {
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid room ID format: ${roomId}`
                });
            }
        }

        // Check if all rooms exist and have available slots
        const rooms = await RoomManagement.find({ _id: { $in: reservation_room } });
        if (rooms.length !== reservation_room.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more rooms not found'
            });
        }
        for (const room of rooms) {
            if (room.slot_availability <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `No available slots for room: ${room.room_name || room._id}`
                });
            }
        }

        // Create new booking reservation
        const newBooking = new Booking_Reservation({
            reservation_room, // Store array of room IDs
            booking_issued_by,
            contact_information,
            mode_of_payment,
            receipt_record,
            booking_date_added: new Date()
        });

        // Save the booking
        const savedBooking = await newBooking.save();
        console.log('Saved booking receipt_expiration:', savedBooking.receipt_record.receipt_expiration);

        // Decrease slot_availability by 1 for each room
        await RoomManagement.updateMany(
            { _id: { $in: reservation_room } },
            { $inc: { slot_availability: -1 } },
            { new: true }
        );

        // Delete queue records associated with booking_issued_by
        await BookingReservation_Queueing.deleteMany({ guest_issued_by: booking_issued_by });

        // Create and save activity log
        const newActivityLog = new ActivityLogs({
            issued_by: booking_issued_by,
            action: 'Hotel Booking',
            action_description: `You booked ${reservation_room.length} hotels with the total of ₱${receipt_record.order_reservation_total.toFixed(2)}`
        });
        await newActivityLog.save();

        // Compose email
        const fullName = `${contact_first_name} ${contact_last_name}${contact_name_suffix ? ' ' + contact_name_suffix : ''}`;
        const roomNames = rooms.map(room => room.room_name || `Room ${room._id}`).join(', ');
        const emailBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2b2b2b;">🎉 Congratulations, ${fullName}!</h2>
                <p>Your hotel booking has been successfully reserved!</p>
                <p>We’re excited to welcome you to our hotel. Below are the details of your reservation:</p>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Booking ID:</strong> ${savedBooking._id}</li>
                    <li><strong>Rooms:</strong> ${roomNames}</li>
                    <li><strong>Total Amount:</strong> ₱${receipt_record.order_reservation_total.toFixed(2)}</li>
                    <li><strong>Payment Method:</strong> ${mode_of_payment}</li>
                    <li><strong>Expires:</strong> ${new Date(savedBooking.receipt_record.receipt_expiration).toLocaleString()}</li>
                    <li><strong>Booking Date:</strong> ${new Date(savedBooking.booking_date_added).toLocaleDateString()}</li>
                </ul>
                ${mode_of_payment === 'Pay thru Counter' ? '<p style="margin-top: 20px; color: #d32f2f;"><strong>Please complete your payment at the counter by the deadline to confirm your booking.</strong></p>' : ''}
                <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>
                <hr>
                <p style="font-size: 12px; color: #888;">Thank you for choosing our Hotel Management Services. We look forward to making your stay unforgettable!</p>
            </div>
        `;

        // Send confirmation email
        await Send(email_address, emailBody);

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Booking reservation created successfully, queue cleared, activity logged, and confirmation email sent',
            data: savedBooking
        });
    } catch (error) {
        console.error('Error in addBookReserve:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking reservation',
            error: error.message
        });
    } finally {
        await mongoose.connection.close();
    }
};

// This should be use once the PayPal already integrates here.
const addBookReservation = async (req, res) => {
    try {
        // Ensure database connection
        await connectToDB();

        // Destructure and validate request body
        const {
            reservation_room,
            booking_issued_by,
            contact_information,
            mode_of_payment,
            receipt_record
        } = req.body;

        // Validate required fields
        if (!reservation_room || !booking_issued_by || !mode_of_payment || !receipt_record) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: reservation_room, booking_issued_by, mode_of_payment, or receipt_record'
            });
        } else if (contact_information) {
            const { email_address, contact_first_name, contact_last_name } = contact_information;
            if (!email_address || !contact_first_name || !contact_last_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required contact information fields: email_address, contact_first_name, or contact_last_name'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Contact information is required for sending confirmation email'
            });
        }

        if (!receipt_record.order_reservation_total || receipt_record.order_reservation_total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing order_reservation_total in receipt_record'
            });
        } else if (!mongoose.Types.ObjectId.isValid(booking_issued_by)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking_issued_by ID format'
            });
        }

        // Check if the room exists and has available slots
        const room = await RoomManagement.findById(reservation_room);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        } else if (room.slot_availability <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No available slots for this room'
            });
        }

        // Create new booking reservation
        const newBooking = new Booking_Reservation({
            reservation_room,
            booking_issued_by,
            contact_information,
            mode_of_payment,
            receipt_record,
            booking_date_added: new Date() // Uses default from schema
        });

        // Save the booking
        const savedBooking = await newBooking.save();

        // Decrease slot_availability by 1
        await RoomManagement.findByIdAndUpdate(
            reservation_room,
            { $inc: { slot_availability: -1 } },
            { new: true }
        );

        // Delete queue records associated with booking_issued_by
        await BookingReservation_Queueing.deleteMany({ guest_issued_by: booking_issued_by });

        // Compose email
        const { email_address, contact_first_name, contact_last_name } = contact_information;
        const fullName = `${contact_first_name} ${contact_last_name}${contact_information.contact_name_suffix ? ' ' + contact_information.contact_name_suffix : ''}`;
        const emailBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2b2b2b;">🎉 Congratulations, ${fullName}!</h2>
                <p>Your hotel booking has been successfully reserved!</p>
                <p>We’re excited to welcome you to our hotel. Below are the details of your reservation:</p>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Booking ID:</strong> ${savedBooking._id}</li>
                    <li><strong>Total Amount:</strong> ₱ ${receipt_record.order_reservation_total.toFixed(2)}</li>
                    <li><strong>Payment Method:</strong> ${mode_of_payment}</li>
                    <li><strong>Booking Date:</strong> ${new Date(savedBooking.booking_date_added).toLocaleDateString()}</li>
                </ul>
                <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>
                <hr>
                <p style="font-size: 12px; color: #888;">Thank you for choosing our Hotel Management Services. We look forward to making your stay unforgettable!</p>
            </div>
        `;

        // Send confirmation email
        await Send(email_address, emailBody);

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Booking reservation created successfully, queue cleared, and confirmation email sent',
            data: savedBooking
        });

    } catch (error) {
        console.error('Error in addBookReserve:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking reservation',
            error: error.message
        });
    } finally {
        await mongoose.connection.close();
    }
}

module.exports = { getAllBookings, getBookingsById, getBookById, addBookReserve, addBookReservation };