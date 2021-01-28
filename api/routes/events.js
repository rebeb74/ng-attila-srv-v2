const express = require('express');
const router = express.Router();
const { auth } = require('../middleware');
const { events: controller } = require('../controllers');

router.post(
    '/events',
    auth,
    controller.createEvent
);

router.get(
    '/events',
    auth,
    controller.getEvents
);

router.get(
    '/events/:id',
    auth,
    controller.getEventById
);

router.get(
    '/share-events/:id',
    auth,
    controller.getShareEventsByUserId
);

router.put(
    '/events/:id',
    auth,
    controller.updateEventById
);

router.delete(
    '/events/:id',
    auth,
    controller.deleteEventById
);

router.delete(
    '/events/',
    auth,
    controller.deleteEventsByIds
);

module.exports = router;
