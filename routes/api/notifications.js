const express = require('express');
const router = express.Router();
const { authenticaton } = require('../../middleware/auth');
const notificationController = require('../../controllers/notificationController');

router.use(authenticaton);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markNotificationRead);
router.patch('/read-all', notificationController.markAllRead);

module.exports = router;

