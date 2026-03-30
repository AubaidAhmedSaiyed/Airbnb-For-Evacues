const { validationResult } = require('express-validator');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const Notification = require('../models/notification');

exports.createBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const listing = await Listing.findById(req.body.listing).populate('host', 'name email role');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    if (!(startDate instanceof Date) || isNaN(startDate)) return res.status(400).json({ message: 'Invalid startDate' });
    if (!(endDate instanceof Date) || isNaN(endDate)) return res.status(400).json({ message: 'Invalid endDate' });
    if (startDate >= endDate) return res.status(400).json({ message: 'startDate must be before endDate' });

    const guestsCount = Number(req.body.guestsCount);
    if (!Number.isInteger(guestsCount) || guestsCount < 1) {
      return res.status(400).json({ message: 'Invalid guestsCount' });
    }
    if (guestsCount > listing.capacity) {
      return res.status(400).json({ message: 'guestsCount exceeds listing capacity' });
    }

    if (listing.availableFrom && startDate < listing.availableFrom) {
      return res.status(400).json({ message: 'Requested dates start before listing availability' });
    }
    if (listing.availableUntil && endDate > listing.availableUntil) {
      return res.status(400).json({ message: 'Requested dates end after listing availability' });
    }

    const conflict = await Booking.findOne({
      listing: listing._id,
      status: 'approved',
      startDate: { $lt: endDate },
      endDate: { $gt: startDate }
    }).select('_id');
    if (conflict) {
      return res.status(409).json({ message: 'Listing is not available for the selected dates' });
    }

    const booking = new Booking({
      listing: listing._id,
      guest: req.user._id,
      startDate,
      endDate,
      guestsCount,
      message: req.body.message || '',
      status: 'pending'
    });
    await booking.save();

    if (listing.host && listing.host._id) {
      await Notification.create({
        user: listing.host._id,
        type: 'booking_requested',
        title: 'New booking request',
        body: `${req.user.name || 'A guest'} requested "${listing.title}".`,
        data: { bookingId: booking._id, listingId: listing._id }
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'guest') filter.guest = req.user._id;
    if (req.user.role === 'host') {
      const listings = await Listing.find({ host: req.user._id }, '_id');
      filter.listing = { $in: listings.map(l => l._id) };
    }

    const bookings = await Booking.find(filter)
      .populate('listing', 'title location capacity')
      .populate('guest', 'name email');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.listing.host.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only host can update booking status' });
    }

    if (status === 'approved') {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        listing: booking.listing._id,
        status: 'approved',
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate }
      }).select('_id');
      if (conflict) {
        return res.status(409).json({ message: 'Cannot approve: dates conflict with another approved booking' });
      }
    }

    booking.status = status;
    await booking.save();

    await Notification.create({
      user: booking.guest,
      type: 'booking_status_updated',
      title: 'Booking status updated',
      body: `Your booking request was ${status}.`,
      data: { bookingId: booking._id, listingId: booking.listing._id, status }
    });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};
