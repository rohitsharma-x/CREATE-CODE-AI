const Notification = require('../models/Notification');

/**
 * Get user notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Notification deleted.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

