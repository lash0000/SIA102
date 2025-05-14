const mongoose = require('mongoose');
const moment = require('moment-timezone');
const HotelLandingArticles = require('./model'); // Import the hotel-landing-article model

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

// GET method: Retrieve landing page articles
const getLandingArticles = async (req, res) => {
    try {
        await connectToDB();
        const { slug, status, category, tags, isFeatured } = req.query;

        // Build query object
        const query = {};
        if (slug) query.slug = slug;
        if (status) query.status = status;
        if (category) query.category = category;
        if (tags) query.tags = { $all: tags.split(',') };
        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

        const articles = await HotelLandingArticles.find(query).sort({ publishedAt: -1 });
        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found matching the criteria' });
        }

        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Server error while fetching articles' });
    } finally {
        await mongoose.connection.close();
    }
};

// POST method: Create or update a landing page article
const createLandingArticle = async (req, res) => {
    try {
        await connectToDB();
        const articleData = req.body;

        // Validate required fields
        if (!articleData.title) {
            return res.status(400).json({ message: 'Article title is required' });
        }
        if (!articleData.slug) {
            return res.status(400).json({ message: 'Article slug is required' });
        }
        if (!articleData.content || !Array.isArray(articleData.content) || articleData.content.length === 0) {
            return res.status(400).json({ message: 'Article content is required and must be a non-empty array' });
        }
        for (const block of articleData.content) {
            if (!block.type || !['paragraph', 'image', 'code', 'quote', 'heading'].includes(block.type)) {
                return res.status(400).json({ message: 'Each content block must have a valid type' });
            }
            if (!block.value) {
                return res.status(400).json({ message: 'Each content block must have a value' });
            }
        }

        // Check if article with the same slug exists
        const existingArticle = await HotelLandingArticles.findOne({ slug: articleData.slug });
        if (existingArticle) {
            // Update existing article
            const updatedArticle = await HotelLandingArticles.findOneAndUpdate(
                { slug: articleData.slug },
                {
                    ...articleData,
                    lastUpdated: moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss'),
                    publishedAt: articleData.status === 'published' && existingArticle.status !== 'published'
                        ? moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss')
                        : existingArticle.publishedAt
                },
                { new: true }
            );
            return res.status(200).json({
                message: 'Article updated successfully',
                data: updatedArticle
            });
        }

        // Create new article
        const newArticle = new HotelLandingArticles({
            ...articleData,
            publishedAt: articleData.status === 'published'
                ? moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss')
                : undefined
        });
        await newArticle.save();
        res.status(201).json({
            message: 'Article created successfully',
            data: newArticle
        });
    } catch (error) {
        console.error('Error creating/updating article:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Article slug must be unique' });
        }
        res.status(500).json({ message: 'Server error while creating/updating article' });
    } finally {
        await mongoose.connection.close();
    }
};

// Export the functions
module.exports = { getLandingArticles, createLandingArticle };