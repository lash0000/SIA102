const jwt = require('jsonwebtoken');
const Auth = require('./model');
const StaffAccount = require('../model');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

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
    const { username, email, password } = req.body;

    try {
        await connectToDB();

        // Try to find user by email OR username
        const user = await StaffAccount.findOne({
            $or: [
                { email_address: email },
                { username: username }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.employee_password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // You mentioned you only want the refresh token for persistent login sessions
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });

        const auth = new Auth({
            issued_by: user._id,
            access_token: null, // optional since you're not using it
            refresh_token: refreshToken
        });

        await auth.save();

        res.status(200).json({ refresh_token: refreshToken });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};

const getAllSessions = async (req, res) => {
    try {
        await connectToDB();
        const sessions = await Auth.find().populate('issued_by', '-employee_password');
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: 'Unable to fetch sessions', error: err.message });
    }
};

module.exports = { login, getAllSessions };
