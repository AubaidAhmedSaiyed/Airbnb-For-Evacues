const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const bookingController = require('../../controllers/bookingController');
const { authenticaton, authorizeRoles } = require('../../middleware/auth');

router.use(authenticaton);

router.post(
  '/',
  [
    check('listing', 'Listing ID is required').notEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
    check('guestsCount', 'Guests count required').isInt({ min: 1 })
  ],
  bookingController.createBooking
);

router.get('/', bookingController.getBookings);

router.patch('/:id/status', authorizeRoles('host'), bookingController.updateBookingStatus);

module.exports = router;
