const login = require('./login');
const users = require('./users');
const events = require('./events');
const tasks = require('./tasks');
const register = require('./register');
const password = require('./password');
const lists = require('./lists');
const notifications = require('./notifications');

/**
 * Routes.
 * @module routes
 */
module.exports = [login, users, events, tasks, register, password, lists, notifications];