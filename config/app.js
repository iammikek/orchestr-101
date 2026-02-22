/**
 * Application Configuration
 * Env vars aligned with orchestr-sh-skeleton.
 */
module.exports = {
  name: process.env.APP_NAME || 'Orchestr 101',
  description: 'A minimal Orchestr API with Laravel-style patterns',
  version: '0.1.0',
  env: process.env.APP_ENV || 'local',
  debug: process.env.APP_DEBUG === 'true',
  port: Number(process.env.APP_PORT) || 3000,
  host: process.env.APP_HOST || 'localhost',
};
