/**
 * Configuration Index
 *
 * Aggregates all configuration files for ConfigServiceProvider.
 * Pattern from orchestr-sh-skeleton.
 */

const app = require('./app');
const database = require('./database');

module.exports = {
  app,
  database,
};
