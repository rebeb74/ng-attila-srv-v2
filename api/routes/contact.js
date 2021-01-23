const express = require('express');
const router = express.Router();
const { contact: controller } = require('../controllers');

router.post(
    '/contact',
    controller.contact
);

module.exports = router;
