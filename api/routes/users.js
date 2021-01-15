const express = require('express');
const router = express.Router();
const { auth } = require('../middleware');
const { users: controller } = require('../controllers');

router.get(
    '/users',
    auth,
    controller.getUsers
);

router.get(
    '/user/:id',
    auth,
    controller.getUserById
);

router.put(
    '/user/:id',
    auth,
    controller.updateUserById
);

router.delete(
    '/user/:id',
    auth,
    controller.deleteUserById
);

module.exports = router;
