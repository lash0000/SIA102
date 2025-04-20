/*
    This section is responsible for handling auto-delete otps per 45 minute.
*/

const mongoose = require('mongoose');
const OTPRegistration = require('./src/api/v1/hotel/otp/registration/model');

const connectToDB = async () => {
    try {
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

exports.handler = async (event) => {
    try {
        await connectToDB();
        const result = await OTPRegistration.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from OTPRegistration model on MongoDB.`);
    } catch (error) {
        console.error('Error deleting documents:', error);
    } finally {
        mongoose.connection.close();
    }
};
