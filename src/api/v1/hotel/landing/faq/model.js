const mongoose = require('mongoose');
const moment = require('moment-timezone');

const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const faqCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [faqItemSchema]
});

const landingPageFaqSchema = new mongoose.Schema({
  categories: [faqCategorySchema],
  lastUpdated: {
    type: String,
    default: () => moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss')
  }
});

const HotelLandingFAQs = mongoose.model('hotel-landing-faqs', landingPageFaqSchema);
module.exports = HotelLandingFAQs;