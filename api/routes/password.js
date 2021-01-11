const express = require('express');
const router = express.Router();
const { password: controller } = require('../controllers');

router.put(
    '/password',
    controller.password
);
module.exports = router;