const mongoose = require('mongoose');
const HotelForums = require('./model');
const GuestUserAccount = require('../guest_users/model');

// Connect to MongoDB
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

// POST: Create a new main thread (by staff)
const createMainThread = async (req, res) => {
    try {
        await connectToDB();
        const { title, content, author } = req.body;

        // Validate required fields
        if (!title || !content || !author) {
            return res.status(400).json({ error: 'Title, content, and author are required' });
        }

        // Verify author exists in hotel_employees_staff_records
        const isValidStaff = await mongoose.model('hotel_employees_staff_records').findById(author);
        if (!isValidStaff) {
            return res.status(400).json({ error: 'Invalid staff author' });
        }

        const newThread = new HotelForums({
            type: 'thread',
            title,
            content,
            author,
        });

        await newThread.save();
        const populatedThread = await HotelForums.findById(newThread._id).populate('author');
        res.status(201).json(populatedThread);
    } catch (error) {
        console.error('Error creating main thread:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET: Fetch all main threads with populated author
const getMainThreads = async (req, res) => {
    try {
        await connectToDB();
        const threads = await HotelForums.find({ type: 'thread' })
            .populate('author', 'employee_id email_address employee_name username employee_role')
            .populate('comments.author');
        res.status(200).json(threads);
    } catch (error) {
        console.error('Error fetching main threads:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST: Add a comment to a main thread (by guest)
const addComment = async (req, res) => {
    try {
        await connectToDB();
        const { threadId, content, author } = req.body;

        // Validate required fields
        if (!threadId || !content || !author) {
            return res.status(400).json({ error: 'Thread ID, content, and author are required' });
        }

        // Verify thread exists
        const thread = await HotelForums.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Verify author exists in GuestUserAccount
        const isValidGuest = await GuestUserAccount.findById(author);
        if (!isValidGuest) {
            return res.status(400).json({ error: 'Invalid guest author' });
        }

        // Add comment to thread
        thread.comments.push({
            content,
            author,
        });

        await thread.save();
        const populatedThread = await HotelForums.findById(threadId)
            .populate('author', 'name email')
            .populate('comments.author', 'name email');
        res.status(201).json(populatedThread);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET: Fetch a single main thread with comments
const getThreadById = async (req, res) => {
    try {
        await connectToDB();
        const { threadId } = req.params;
        const thread = await HotelForums.findById(threadId)
            .populate('author', 'employee_id email_address employee_name username employee_role')
            .populate('comments.author');
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        res.status(200).json(thread);
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createMainThread,
    getMainThreads,
    addComment,
    getThreadById,
};