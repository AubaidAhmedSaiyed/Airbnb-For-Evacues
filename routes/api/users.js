const express = require('express');
const router = express.Router();
const { authenticaton } = require('../../middleware/auth');
const userController = require('../../controllers/userController');
const dashboardController = require('../../controllers/dashboardController');

router.get('/me', authenticaton, userController.getProfile);
router.patch('/me', authenticaton, userController.updateProfile);
router.get('/me/dashboard', authenticaton, dashboardController.getMyDashboard);

module.exports = router;
