const { validationResult } = require('express-validator');
const Listing = require('../models/listing');
const Booking = require('../models/booking');

exports.createListing = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const listing = new Listing({ ...req.body, host: req.user._id });
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const {
      q,
      location,
      country,
      address,
      capacity,
      startDate,
      endDate
    } = req.query;
    const filter = {};

    const locationQuery = country || location;
    if (locationQuery) {
      filter['location.country'] = { $regex: String(locationQuery), $options: 'i' };
    }
    if (address) {
      filter['location.address'] = { $regex: String(address), $options: 'i' };
    }
    if (capacity) {
      filter.capacity = { $gte: Number(capacity) };
    }

    if (q) {
      const re = { $regex: String(q), $options: 'i' };
      filter.$or = [
        { title: re },
        { description: re },
        { 'location.address': re },
        { 'location.country': re }
      ];
    }

    let listingsQuery = Listing.find(filter).populate('host', 'name email role');

    // Availability filter by requested date range:
    // - must fall within listing.availableFrom/availableUntil if set
    // - must not overlap with any approved booking for that listing
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end) || start >= end) {
        return res.status(400).json({ message: 'Invalid startDate/endDate' });
      }

      listingsQuery = listingsQuery.where({
        $and: [
          {
            $or: [
              { availableFrom: { $exists: false } },
              { availableFrom: null },
              { availableFrom: { $lte: start } }
            ]
          },
          {
            $or: [
              { availableUntil: { $exists: false } },
              { availableUntil: null },
              { availableUntil: { $gte: end } }
            ]
          }
        ]
      });

      const conflictingListingIds = await Booking.distinct('listing', {
        status: 'approved',
        startDate: { $lt: end },
        endDate: { $gt: start }
      });
      if (conflictingListingIds.length) {
        listingsQuery = listingsQuery.where({ _id: { $nin: conflictingListingIds } });
      }
    }

    const listings = await listingsQuery;
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host', 'name email role');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!listing.host.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });

    Object.assign(listing, req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!listing.host.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });

    await Listing.deleteOne({ _id: listing._id });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};
