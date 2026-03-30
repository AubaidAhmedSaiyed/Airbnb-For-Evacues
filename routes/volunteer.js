const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const User = require('../models/user');

const DEFAULT_HOST_EMAIL = 'host@example.com';

const findHost = async (req) => {
  if (req.user) return req.user;
  return User.findOne({ email: DEFAULT_HOST_EMAIL });
};

// volunteer dashboard
router.get('/', async (req, res, next) => {
  try {
    const host = await findHost(req);
    if (!host) return res.status(404).send('Host account not found');

    const listings = await Listing.find({ host: host._id });
    const listingIds = listings.map(l => l._id);
    const bookings = await Booking.find({ listing: { $in: listingIds } }).populate('listing guest', 'title name email');

    res.render('volunteer/dashboard', { host, listings, bookings });
  } catch (err) {
    next(err);
  }
});

// add shelter form
router.get('/new', (req, res) => {
  res.render('volunteer/newShelter');
});

// create shelter
router.post('/', async (req, res, next) => {
  try {
    const host = await findHost(req);
    if (!host) return res.status(404).send('Host account not found');

    const form = req.body;
    const newListing = new Listing({
      host: host._id,
      title: form.title || `Shelter by ${host.name}`,
      description: form.description || form.notes || 'No description',
      location: { address: form.address, country: form.country },
      price: Number(form.price) || 0,
      capacity: Number(form.capacity) || 1,
      images: form.image ? [form.image] : [],
      availableFrom: form.availableFrom,
      availableUntil: form.availableUntil
    });

    await newListing.save();
    res.redirect('/volunteer');
  } catch (err) {
    next(err);
  }
});

// list shelters for current volunteer
router.get('/myShelter', async (req, res, next) => {
  try {
    const host = await findHost(req);
    if (!host) return res.status(404).send('Host account not found');
    const listings = await Listing.find({ host: host._id });
    res.render('volunteer/myShelter', { host, listings });
  } catch (err) {
    next(err);
  }
});

// edit form
router.get('/myShelter/:listingId/edit', async (req, res, next) => {
  try {
    const host = await findHost(req);
    if (!host) return res.status(404).send('Host account not found');

    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send('Shelter not found');
    if (!listing.host.equals(host._id)) return res.status(403).send('Forbidden');

    res.render('volunteer/editShelter', { listing });
  } catch (err) {
    next(err);
  }
});

// update shelter
router.post('/myShelter/:listingId', async (req, res, next) => {
  try {
    const host = await findHost(req);
    if (!host) return res.status(404).send('Host account not found');

    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send('Shelter not found');
    if (!listing.host.equals(host._id)) return res.status(403).send('Forbidden');

    const form = req.body;
    if (form.title !== undefined) listing.title = form.title;
    if (form.description !== undefined) listing.description = form.description;
    if (form.address !== undefined || form.country !== undefined) {
      listing.location = {
        address: form.address ?? listing.location.address,
        country: form.country ?? listing.location.country
      };
    }
    if (form.price !== undefined) listing.price = Number(form.price) || 0;
    if (form.capacity !== undefined) listing.capacity = Number(form.capacity) || listing.capacity;
    if (form.image !== undefined) listing.images = form.image ? [form.image] : [];
    if (form.availableFrom !== undefined) listing.availableFrom = form.availableFrom || undefined;
    if (form.availableUntil !== undefined) listing.availableUntil = form.availableUntil || undefined;

    await listing.save();
    res.redirect('/volunteer/myShelter');
  } catch (err) {
    next(err);
  }
});

// delete shelter
router.post('/myShelter/:listingId/delete', async (req, res, next) => {
  try {
    const host = await findHost(req);
    if (!host) return res.status(404).send('Host account not found');

    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send('Shelter not found');
    if (!listing.host.equals(host._id)) return res.status(403).send('Forbidden');

    await Listing.deleteOne({ _id: listing._id });
    res.redirect('/volunteer/myShelter');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
