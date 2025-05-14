const mongoose = require('mongoose');
const HotelLandingFAQs = require('./model'); // Import the hotel-landing-faqs model

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

// GET method: Retrieve the landing page FAQs
const getLandingPageFAQs = async (req, res) => {
    try {
        await connectToDB();
        const faqs = await HotelLandingFAQs.findOne();
        if (!faqs) {
            return res.status(404).json({ message: 'FAQ data not found' });
        }
        res.status(200).json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Server error while fetching FAQs' });
    } finally {
        await mongoose.connection.close();
    }
};

// POST method: Create or update the landing page FAQs
const createLandingPageFAQs = async (req, res) => {
    try {
        await connectToDB();
        const faqData = req.body;

        // Validate required fields
        if (!faqData.categories || !Array.isArray(faqData.categories) || faqData.categories.length === 0) {
            return res.status(400).json({ message: 'At least one FAQ category is required' });
        }
        for (const category of faqData.categories) {
            if (!category.category || !category.items || !Array.isArray(category.items) || category.items.length === 0) {
                return res.status(400).json({ message: 'Each category must have a name and at least one FAQ item' });
            }
            for (const item of category.items) {
                if (!item.question || !item.answer) {
                    return res.status(400).json({ message: 'Each FAQ item must have a question and answer' });
                }
            }
        }

        // Check if FAQ data already exists
        const existingFAQs = await HotelLandingFAQs.findOne();
        if (existingFAQs) {
            // Update existing document
            const updatedFAQs = await HotelLandingFAQs.findOneAndUpdate(
                {},
                { categories: faqData.categories, lastUpdated: require('moment-timezone')().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss') },
                { new: true }
            );
            return res.status(200).json({
                message: 'FAQ data updated successfully',
                data: updatedFAQs
            });
        }

        // Create new document
        const newFAQs = new HotelLandingFAQs(faqData);
        await newFAQs.save();
        res.status(201).json({
            message: 'FAQ data created successfully',
            data: newFAQs
        });
    } catch (error) {
        console.error('Error creating/updating FAQs:', error);
        res.status(500).json({ message: 'Server error while creating/updating FAQs' });
    } finally {
        await mongoose.connection.close();
    }
};

// Export the functions
module.exports = { getLandingPageFAQs, createLandingPageFAQs };