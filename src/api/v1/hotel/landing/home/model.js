const mongoose = require('mongoose');
const moment = require('moment-timezone');

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  content: { type: String },
  imageUrl: { type: String },
  callToAction: {
    label: { type: String },
    link: { type: String }
  }
});

const landingPageHomeSchema = new mongoose.Schema({
  heroSection: sectionSchema,
  features: [sectionSchema],
  testimonials: [{
    name: { type: String },
    role: { type: String },
    feedback: { type: String },
    avatarUrl: { type: String }
  }],
  faqSection: [{
    question: { type: String },
    answer: { type: String }
  }],
  lastUpdated: {
    type: String,
    default: () => moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss')
  }
});

const HotelLandingPage = mongoose.model('hotel-landing-page', landingPageHomeSchema);
module.exports = HotelLandingPage;