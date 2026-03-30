const Listing = require('../models/listing');
const Booking = require('../models/booking');
const Notification = require('../models/notification');

exports.getMyDashboard = async (req, res, next) => {
  try {
    if (req.user.role === 'host') {
      const listings = await Listing.find({ host: req.user._id }).sort({ createdAt: -1 });
      const listingIds = listings.map(l => l._id);
      const bookings = await Booking.find({ listing: { $in: listingIds } })
        .sort({ createdAt: -1 })
        .populate('listing', 'title location capacity')
        .populate('guest', 'name email');

      const notifications = await Notification.find({ user: req.user._id, readAt: null })
        .sort({ createdAt: -1 })
        .limit(20);

      return res.json({ role: 'host', listings, bookings, notifications });
    }

    const bookings = await Booking.find({ guest: req.user._id })
      .sort({ createdAt: -1 })
      .populate('listing', 'title location capacity images')
      .populate('guest', 'name email');

    const notifications = await Notification.find({ user: req.user._id, readAt: null })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ role: 'guest', bookings, notifications });
  } catch (err) {
    next(err);
  }
};

