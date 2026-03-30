const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    country: { type: String, required: true }
  },
  price: { type: Number, default: 0 },
  capacity: { type: Number, required: true },
  images: [{ type: String }],
  availableFrom: Date,
  availableUntil: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
