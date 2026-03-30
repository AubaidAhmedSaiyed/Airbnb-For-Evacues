const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const authController = require('../../controllers/authController');

router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password must be at least 6 chars').isLength({ min: 6 })
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

module.exports = router;
