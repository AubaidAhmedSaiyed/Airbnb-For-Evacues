const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['booking_requested', 'booking_status_updated'],
    required: true
  },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  data: { type: Object, default: {} },
  readAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

