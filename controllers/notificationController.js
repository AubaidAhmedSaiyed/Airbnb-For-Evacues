const Notification = require('../models/notification');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit } = req.query;
    const filter = { user: req.user._id };
    if (unreadOnly === 'true') filter.readAt = null;

    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200));

    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (!notification.readAt) notification.readAt = new Date();
    await notification.save();
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      { user: req.user._id, readAt: null },
      { $set: { readAt: now } }
    );
    res.json({ message: 'Marked all as read', modifiedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};

