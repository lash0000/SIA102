/*
*   This feature is for Chat Assistance Group (between Guest,Staffs and Managers).
*/

const StaffAccount = require('../staff_accounts/model');
const GuestAccount = require('../guest_users/model');
const AssistanceChat = require('./model');
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
            return res.status(400).json({
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields: _id and chat_message property.' })
            });
        }

        const isStaff = await StaffAccount.findById(_id).lean();
        const isGuest = await GuestAccount.findById(_id).lean();

        if (!isStaff && !isGuest) {
            return res.status(404).json({
                statusCode: 404,
                body: JSON.stringify({ message: 'No matching StaffAccount or GuestAccount found for provided _id.' })
            });
        }

        const newChatData = new AssistanceChat({
            chat_message,
            staff_issued_by: isStaff ? _id : undefined,
            guest_issued_by: isGuest ? _id : undefined
        });

        await newChatData.save();

        res.status(201).json({
            statusCode: 201,
            body: JSON.stringify({ message: 'Chat message created successfully.', chat: newChatData })
        });

    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error.' })
        });
    }
};

// PUT 



module.exports = { getAllChats, newChat };