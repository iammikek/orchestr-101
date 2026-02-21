/**
 * HTTP Entry Point
 *
 * Bootstraps the application and starts the server.
 * Pattern from orchestr-sh-skeleton.
 *
 * Usage: node public/index.js  (or npm run serve / npm run start)
 */

const { Kernel } = require('@orchestr-sh/orchestr');
const { createApp } = require('../bootstrap/app');

async function ensureItemsTable(app) {
  const db = app.make('db');
  const connection = db.connection();
  await connection.connect();
  const adapter = connection.getAdapter();
  const raw = adapter.rawClient;
  if (raw) {
    raw.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category VARCHAR(100)
      )
    `);
  }
}

async function main() {
  const app = createApp();
  await app.boot();

  await ensureItemsTable(app);

  const kernel = new Kernel(app);
  const config = app.make('config');
  const port = config.get('app.port', 3000);
  const host = config.get('app.host', 'localhost');

  kernel.listen(port, host, () => {
    console.log(`\x1b[32m[Orchestr]\x1b[0m Server running at http://${host}:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
