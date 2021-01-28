const express = require('express');
const router = express.Router();
const { auth } = require('../middleware');
const {
    notifications: controller
} = require('../controllers');

router.post(
    '/notification',
    auth,
    controller.createNotification
);

router.get(
    '/notifications',
    auth,
    controller.getNotifications
);

router.get(
    '/notification/:id',
    auth,
    controller.getNotificationById
);

router.put(
    '/notification/:id',
    auth,
    controller.updateNotificationById
);

router.delete(
    '/notification/:id',
    auth,
    controller.deleteNotificationById
);

module.exports = router;
