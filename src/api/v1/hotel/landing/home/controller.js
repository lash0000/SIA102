const mongoose = require('mongoose');
const HotelLandingPage = require('./model'); // Import the hotel-landing-page model
const moment = require('moment-timezone');

// Database connection function
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

// GET method: Retrieve the Home landing page data
const getHomeLandingPage = async (req, res) => {
    try {
        await connectToDB(); // Ensure DB connection
        const landingPage = await HotelLandingPage.findOne(); // Fetch the first (or only) document
        if (!landingPage) {
            return res.status(404).json({ message: 'Home landing page data not found' });
        }
        res.status(200).json(landingPage);
    } catch (error) {
        console.error('Error fetching home landing page:', error);
        res.status(500).json({ message: 'Server error while fetching home landing page' });
    } finally {
        await mongoose.connection.close(); // Close connection after operation
    }
};

// POST method: Create or update the Home landing page data
const createHomeLandingPage = async (req, res) => {
    try {
        await connectToDB(); // Ensure DB connection
        const landingPageData = req.body; // Data from request body

        // Validate required fields (e.g., heroSection.title)
        if (!landingPageData.heroSection || !landingPageData.heroSection.title) {
            return res.status(400).json({ message: 'Hero section title is required' });
        }

        // Check if a landing page already exists
        const existingLandingPage = await HotelLandingPage.findOne();
        if (existingLandingPage) {
            // Update existing document
            const updatedLandingPage = await HotelLandingPage.findOneAndUpdate(
                {},
                { ...landingPageData, lastUpdated: moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss') },
                { new: true } // Return the updated document
            );
            return res.status(200).json({
                message: 'Home landing page updated successfully',
                data: updatedLandingPage
            });
        }

        // Create new document if none exists
        const newLandingPage = new HotelLandingPage(landingPageData);
        await newLandingPage.save();
        res.status(201).json({
            message: 'Home landing page created successfully',
            data: newLandingPage
        });
    } catch (error) {
        console.error('Error creating/updating home landing page:', error);
        res.status(500).json({ message: 'Server error while creating/updating home landing page' });
    } finally {
        await mongoose.connection.close(); // Close connection after operation
    }
};

// PUT method: Update the Home landing page data
const updateHomeLandingPage = async (req, res) => {
    try {
        await connectToDB(); // Ensure DB connection
        const updateData = req.body; // Data from request body

        // Validate that some update data is provided
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        // Update the existing document
        const updatedLandingPage = await HotelLandingPage.findOneAndUpdate(
            {},
            { 
                $set: { 
                    ...updateData, 
                    lastUpdated: moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss') 
                } 
            },
            { 
                new: true, // Return the updated document
                runValidators: true // Ensure schema validations are applied
            }
        );

        if (!updatedLandingPage) {
            return res.status(404).json({ message: 'Home landing page data not found' });
        }

        res.status(200).json({
            message: 'Home landing page updated successfully',
            data: updatedLandingPage
        });
    } catch (error) {
        console.error('Error updating home landing page:', error);
        res.status(500).json({ message: 'Server error while updating home landing page' });
    } finally {
        await mongoose.connection.close(); // Close connection after operation
    }
};

// Export the functions
module.exports = { getHomeLandingPage, createHomeLandingPage, updateHomeLandingPage };