const auth = require('./auth');
const events = require('./events');
const register = require('./register');
const tasks = require('./tasks');
const users = require('./users');
const password = require('./password');
const lists = require('./lists');
const notifications = require('./notifications');
const contact = require('./contact');

/**
 * Controllers.
 * @module controllers
 */

module.exports = {
  auth,
  events,
  register,
  tasks,
  users,
  password,
  notifications,
  lists,
  contact
};
