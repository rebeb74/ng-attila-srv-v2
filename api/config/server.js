/**
 * Server configuration.
 * @module config/server
 */

/**
 * Initialize the configuration.
 * @param {Object} env - The environment variables.
 */
module.exports = () => ({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  db: process.env.DB
});
