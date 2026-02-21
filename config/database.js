const path = require('path');

/**
 * Database Configuration
 * Env vars aligned with orchestr-sh-skeleton (DB_DATABASE, etc.).
 */
module.exports = {
  default: process.env.DB_CONNECTION || 'sqlite',
  connections: {
    sqlite: {
      adapter: 'drizzle',
      driver: 'better-sqlite3',
      database: process.env.DB_DATABASE || path.join(process.cwd(), 'database', 'database.sqlite'),
    },
  },
};
