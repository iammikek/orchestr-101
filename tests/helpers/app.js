/**
 * Test app and HTTP server helper.
 * Creates app with test DB, ensures items table, starts server on random port.
 */
const http = require('http');
const { Kernel } = require('@orchestr-sh/orchestr');
const { createApp } = require('../../bootstrap/app');

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

/**
 * Create app, boot, ensure table, start HTTP server on random port.
 * @returns {{ baseUrl: string, close: () => Promise<void>, app: import('@orchestr-sh/orchestr').Application }}
 */
async function createTestServer() {
  const app = createApp();
  await app.boot();
  await ensureItemsTable(app);

  const kernel = new Kernel(app);
  const server = http.createServer((req, res) => {
    kernel.handle(req, res).catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: err.message }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    app,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

/**
 * Clear all rows from items table (between tests).
 * @param {import('@orchestr-sh/orchestr').Application} app
 */
async function clearItems(app) {
  if (!app) return;
  const db = app.make('db');
  const connection = db.connection();
  await connection.connect();
  const adapter = connection.getAdapter();
  const raw = adapter.rawClient;
  if (raw) raw.exec('DELETE FROM items');
}

module.exports = { createTestServer, ensureItemsTable, clearItems };
