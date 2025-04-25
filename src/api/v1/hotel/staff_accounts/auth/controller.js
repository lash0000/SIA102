const jwt = require('jsonwebtoken');
const Auth = require('./model');
const StaffAccount = require('../model');
const GuestAccount = require('../../guest_users/model');
const GuestAuthSchema = require('../../guest_users/auth/model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

// SECRET KEYS (Should ideally be in .env)
// const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

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

const login = async (req, res) => {
    const { username, email_address, password } = req.body;

    try {
        await connectToDB();

        let user = null;
        let isGuest = false;
        let source = null; // New: track whether it matched via 'username' or 'email_address'

        // Try StaffAccount first
        if (email_address) {
            user = await StaffAccount.findOne({ email_address: email_address });
            source = 'email';
        }
        if (!user && username) {
            user = await StaffAccount.findOne({ username: username });
            source = 'username';
        }

        // Try GuestAccount if not found in StaffAccount
        if (!user) {
            if (email_address) {
                user = await GuestAccount.findOne({ email_address: email_address });
                source = 'email';
            }
            if (!user && username) {
                user = await GuestAccount.findOne({ username: username });
                source = 'username';
            }
            if (user) isGuest = true;
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Password checking
        let hashedPassword = null;

        if (isGuest) {
            hashedPassword = user.guest_password;
        } else {
            hashedPassword = user.employee_password;
        }

        if (!hashedPassword) {
            return res.status(401).json({ message: 'Invalid credentials: No password set.' });
        }

        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            console.log(`Login failed. Tried ${source}:`, source === 'email' ? email_address : username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create refresh token
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });

        // Save auth record
        if (isGuest) {
            const guest_auth = new GuestAuthSchema({
                issued_by: user._id,
                access_token: null,
                refresh_token: refreshToken
            });
            await guest_auth.save();
        } else {
            const auth = new Auth({
                issued_by: user._id,
                access_token: null,
                refresh_token: refreshToken
            });
            await auth.save();
        }

        res.status(200).json({
            refresh_token: refreshToken,
            role: isGuest ? 'guest' : 'staff'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};



const getAllSessions = async (req, res) => {
    try {
        await connectToDB();

        // Get staff sessions
        const staffSessions = await Auth.find()
            .populate('issued_by', '-employee_password')
            .lean(); // Convert to plain JS object

        // Get guest sessions
        const guestSessions = await GuestAuthSchema.find()
            .populate('issued_by', '-guest_password')
            .lean();

        // Merge both results
        const allSessions = [...staffSessions, ...guestSessions];

        // Optionally sort by latest session
        allSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(allSessions);

    } catch (err) {
        res.status(500).json({ message: 'Unable to fetch sessions', error: err.message });
    }
};


module.exports = { login, getAllSessions };
