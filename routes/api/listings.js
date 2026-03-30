const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const listingController = require('../../controllers/listingController');
const { authenticaton } = require('../../middleware/auth');

router.get('/', listingController.getListings);
router.get('/:id', listingController.getListingById);

router.post(
  '/',
  authenticaton,
  [
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('location.address', 'Address is required').notEmpty(),
    check('location.country', 'Country is required').notEmpty(),
    check('capacity', 'Capacity must be a positive integer').isInt({ min: 1 })
  ],
  listingController.createListing
);

router.patch('/:id', authenticaton, listingController.updateListing);
router.delete('/:id', authenticaton, listingController.deleteListing);

module.exports = router;
