const express = require('express');
const Listing = require('../models/listing');
const router = express.Router();

// evacuee dashboard
router.get('/', async (req, res) => {
  const allshelter = await Listing.find({});
  res.render('evacuee/dashboard', { allshelter });
});

// show all shelters
router.get('/shelters', async (req, res) => {
  const allshelter = await Listing.find({}).populate('host', 'name contact');
  res.render('evacuee/index', { allshelter });
});

// show one shelter
router.get('/shelters/:id', async (req, res) => {
  const { id } = req.params;
  const shelter = await Listing.findById(id).populate('host', 'name contact');
  res.render('evacuee/show', { shelter });
});

module.exports = router;
