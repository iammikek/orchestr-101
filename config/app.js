/**
 * Application Configuration
 */
module.exports = {
  name: process.env.APP_NAME || 'Orchestr 101',
  description: 'A minimal Orchestr API with Laravel-style patterns',
  version: '0.1.0',
  env: process.env.APP_ENV || 'local',
  debug: process.env.APP_DEBUG === 'true',
  port: Number(process.env.APP_PORT) || 8005,
  host: process.env.APP_HOST || '127.0.0.1',
  jwt_secret: process.env.JWT_SECRET || 'change-me-in-production',
};
