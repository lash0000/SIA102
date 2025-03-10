// src/api/v1/hotel/uploads/room_management/controller.js

const mongoose = require('mongoose');
const HotelRooms = require('../room_management/model');

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

// Here's my criteria btw

/*

1. Just kindly first use the HotelRooms which locates to // src/api/v1/hotel/uploads/room_management/model.js
I provided my code I hope you see it

2. Here at this 

*/