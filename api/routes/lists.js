const express = require('express');
const router = express.Router();
const { auth } = require('../middleware');
const { lists: controller } = require('../controllers');

router.post(
    '/lists',
    auth,
    controller.createList
);

router.get(
    '/lists',
    auth,
    controller.getLists
);

router.get(
    '/lists/:id',
    auth,
    controller.getListById
);

router.put(
    '/lists/:id',
    auth,
    controller.updateListById
);

router.delete(
    '/lists/:id',
    auth,
    controller.deleteListById
);

module.exports = router;