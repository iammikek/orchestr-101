/**
 * Get raw DB client for DDL/DML that need .run() instead of .all()
 * (orchestr DrizzleAdapter uses .all() for query() so UPDATE/DELETE fail on SQLite)
 */
async function getRawDb() {
  const { getApp } = require('../appInstance');
  const app = getApp();
  if (!app) return null;
  const db = app.make('db');
  const connection = db.connection();
  await connection.connect();
  const adapter = connection.getAdapter();
  return adapter.rawClient || null;
}

async function runUpdate(sql, bindings = []) {
  const raw = await getRawDb();
  if (!raw) return 0;
  const stmt = raw.prepare(sql);
  const result = stmt.run(...bindings);
  return result.changes ?? 0;
}

async function runDelete(sql, bindings = []) {
  return runUpdate(sql, bindings);
}

module.exports = { getRawDb, runUpdate, runDelete };
