const mongoose = require('mongoose');
const moment = require('moment-timezone');

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['paragraph', 'image', 'code', 'quote', 'heading'],
    required: true
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true }, // for URL e.g. /blog/how-to-use-mongodb
  author: { type: String, default: 'Anonymous' },
  summary: { type: String }, // short intro / excerpt
  tags: [String],
  category: { type: String },
  content: [contentBlockSchema],
  featuredImage: { type: String },
  isFeatured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: String,
    default: () => moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss')
  },
  lastUpdated: {
    type: String,
    default: () => moment().tz("Asia/Manila").format('YYYY-MM-DD HH:mm:ss')
  }
});

const LandingArticles = mongoose.model('hotel-landing-article', articleSchema);
module.exports = LandingArticles;