/**
 * Vitest setup: run before tests.
 * Use a separate test database so we don't touch app data.
 */
const path = require('path');

process.env.DB_DATABASE = path.join(process.cwd(), 'database', 'test.sqlite');
