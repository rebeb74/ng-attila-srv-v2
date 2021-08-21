/**
 * Token configuration.
 * @module config/token
 */

/**
 * Initialize the configuration.
 * @param {Object} env - The environment variables.
 */
// module.exports = () => ({
//   accessToken: {
//     secret: process.env.ACCESS_TOKEN_SECRET,
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
//   },
//   refreshToken: {
//     expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
//   }
// });
module.exports = (env) => ({
  accessToken: {
    secret: env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN || process.env.ACCESS_TOKEN_EXPIRES_IN
  },
  refreshToken: {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN || process.env.REFRESH_TOKEN_EXPIRES_IN
  }
});
