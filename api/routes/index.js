const login = require('./login');
const events = require('./events');
const tasks = require('./tasks');
const register = require('./register');
const password = require('./password');
const lists = require('./lists');
const notifications = require('./notifications');
const contact = require('./contact');

/**
 * Routes.
 * @module routes
 */
module.exports = [login, events, tasks, register, password, lists, notifications, contact];
