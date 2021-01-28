const express = require('express');
const router = express.Router();
const { register: controller } = require('../controllers');

router.post(
    '/user',
    controller.register
);
module.exports = router;
