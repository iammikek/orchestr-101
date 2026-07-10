/**
 * Test app and HTTP server helper.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Kernel } = require('@orchestr-sh/orchestr');
const { createApp } = require('../../bootstrap/app');
const { sessionMiddleware } = require('../../middleware/session');
const { exceptionHandler } = require('../../middleware/exceptionHandler');

async function migrateTestDatabase(app) {
  const db = app.make('db');
  const connection = db.connection();
  await connection.connect();
  const adapter = connection.getAdapter();
  const raw = adapter.rawClient;
  if (!raw) return;

  const schema = fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8');
  raw.exec(schema);
}

async function resetTables(app) {
  const db = app.make('db');
  const connection = db.connection();
  await connection.connect();
  const adapter = connection.getAdapter();
  const raw = adapter.rawClient;
  if (!raw) return;
  raw.exec('DELETE FROM items; DELETE FROM categories; DELETE FROM users;');
}

async function createTestServer() {
  const app = createApp();
  await app.boot();
  await migrateTestDatabase(app);

  const kernel = new Kernel(app);
  kernel.use(sessionMiddleware);
  kernel.use(exceptionHandler);

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
    resetTables: () => resetTables(app),
  };
}

module.exports = { createTestServer, resetTables, migrateTestDatabase };
