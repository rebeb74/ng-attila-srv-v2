/**
 * Token configuration.
 * @module config/token
 */

/**
 * Initialize the configuration.
 * @param {Object} env - The environment variables.
 */
module.exports = env => ({
  accessToken: {
    secret: env.ACCESS_TOKEN_SECRET,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
  },
  refreshToken: {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
  }
});
