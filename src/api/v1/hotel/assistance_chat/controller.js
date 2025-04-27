/*
*   This feature is for Chat Assistance Group (between Guest,Staffs and Managers).
*/

const StaffAccount = require('../staff_accounts/model');
const GuestAccount = require('../guest_users/model');
const AssistanceChat = require('./model');
const mongoose = require('mongoose');

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

/**
 * GET = mag-retrieve ng mga existing datasets
 * POST = mag-submit ng new data
 * PUT (UPDATE) = sa existing na datasets need kasi nun may ID so clearly more on mag-update ka lang mismo ng existing na data
 * DELETE = ganun
 */

// GET 
const getAllChats = async (req, res) => {
    try {
        await connectToDB();

        const chats = await AssistanceChat.find()
            .populate({ path: 'staff_issued_by', model: StaffAccount, select: '-__v' })
            .populate({ path: 'guest_issued_by', model: GuestAccount, select: '-__v' })
            .sort({ chat_message_date: 1 }); // sort oldest to newest (optional)

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST
const newChat = async (req, res) => {
    try {
        await connectToDB();
        const { _id, chat_message } = req.body;

        if (!_id || !chat_message) {
            return res.status(400).json({ message: 'Missing required fields for user ID.' });
        }

        // Check if _id exists between StaffAccount and GuestAccount model
        const staffAccount = await StaffAccount.findById(_id);
        const guestAccount = staffAccount ? null : await GuestAccount.findById(_id);

        if (!staffAccount && !guestAccount) {
            return res.status(404).json({ message: 'No matching Staff or Guest found for provided _id.' });
        }

        // Prepare new chat entry
        const newChatEntry = new AssistanceChat({
            staff_issued_by: staffAccount ? staffAccount._id : undefined,
            guest_issued_by: guestAccount ? guestAccount._id : undefined,
            chat_message: chat_message,
        });

        await newChatEntry.save();

        res.status(201).json({ 
            message: 'Chat message successfully sent.', 
            chat: newChatEntry 
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT 



module.exports = { getAllChats, newChat };