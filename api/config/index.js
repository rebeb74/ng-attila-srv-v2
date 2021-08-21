const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');
const token = require('./token');
const server = require('./server');

let env = dotenv.config({});
// if (env.error) throw env.error;
if (!env.error) {
  env = dotenvParseVariables(env.parsed);
}

/**
 * Global configuration.
 * @module config
 */
module.exports = {
  token: token(env || process.env),
  server: server(env || process.env),
};
