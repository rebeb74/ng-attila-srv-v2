const express = require('express');
const router = express.Router();
const { password: controller } = require('../controllers');

router.post(
    '/reset',
    controller.reset
);

router.get(
    '/reset-confirm/:token',
    controller.resetConfirmValid
);

router.post(
    '/reset-confirm/:token',
    controller.resetConfirm
);

module.exports = router;
