const express = require('express');
const bodyParser = require('body-parser');
const {
  auth: controller
} = require('../controllers');

const router = express.Router();

router.post(
  '/login',
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true
  }),
  controller.login
);

router.post(
  '/token',
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true
  }),
  controller.refreshToken
);

router.post(
  '/logout',
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true
  }),
  controller.logout
);

module.exports = router;
