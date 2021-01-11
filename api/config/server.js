const path = require('path');
const appRoot = require('app-root-path');

/**
 * Server configuration.
 * @module config/server
 */

/**
 * Initialize the configuration.
 * @param {Object} env - The environment variables.
 */
module.exports = env => ({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  db: process.env.DB
});
