const Notification = require('../models/notification');

/**
 * Anything controller.
 * @module controllers/notifications
 */

/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.createNotification = async (req, res) => {
  try {

    const notification = new Notification(req.body);
    await notification.save((err, notification) => {
      res.status(201).json(notification);
    });

  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports.getNotifications = (req, res) => {
  Notification.find({
      notificationUserId: req.user._id
    })
    .sort({
      'createdOn': -1
    })
    .exec()
    .then((notifications) => {
      res.status(200).json(notifications);
    })
    .catch((err) => res.status(500).json({
      message: 'no notifications found :(',
      code: 'notifications_not_found',
      error: err
    }));
};

module.exports.getNotificationById = (req, res) => {
  const id = req.params.id;
  Notification.findById(id)
    .then((notification) => {
      if (notification.notificationUserId == req.user._id || req.user.isAdmin) {
        return res.status(200).json(notification);
      } else {
        return res.status(403).json({
          message: 'unauthorized access',
          code: 'unauthorized_access'
        });
      }

    })
    .catch((err) => res.status(404).json({
      message: 'notification not found',
      error: err,
      code: 'notification_not_found'
    }));
};

module.exports.updateNotificationById = (req, res) => {
  const id = req.params.id;
  Notification.findById(id)
    .then((notification) => {
      if (notification.notificationUserId == req.user._id || req.user.isAdmin) {
        Notification.findByIdAndUpdate(id, {
            read: req.body.read,
          },
          (err) => {
            if (err) {
              return res.status(500).json(err);
            }
            res.status(202).json({
              msg: 'notification updated'
            });
          });
      } else {
        return res.status(403).json({
          message: 'unauthorized access',
          code: 'unauthorized_access'
        });
      }
    })
    .catch((err) => res.status(404).json({
      message: `notification with id ${id} not found`,
      error: err,
      code: 'notification_not_found'
    }));
};

module.exports.deleteNotificationById = (req, res) => {
  const id = req.params.id;
  Notification.findById(id)
    .then((notification) => {
      if (notification.notificationUserId == req.user._id || req.user.isAdmin) {
        Notification.findByIdAndDelete(id, (err) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(202).json({
            msg: 'notification deleted'
          });
        });
      } else {
        return res.status(403).json({
          message: 'unauthorized access',
          code: 'unauthorized_access'
        });
      }
    })
    .catch((err) => res.status(404).json({
      message: `notification with id ${id} not found`,
      error: err,
      code: 'notification_not_found'
    }));
};
