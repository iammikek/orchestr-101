#!/usr/bin/env node
/**
 * Console CLI Entry Point
 *
 * Boots the application and runs console commands.
 * Pattern from orchestr-sh-skeleton.
 *
 * Usage:
 *   node bootstrap/cli.js migrate
 *   node bootstrap/cli.js migrate:status
 *   npm run orchestr migrate
 */

const { createApp } = require('./app');
const { AppConsoleKernel } = require('../app/Console/Kernel');

async function main() {
  const app = createApp();
  await app.boot();

  const kernel = new AppConsoleKernel(app);
  await kernel.run(process.argv);
}

main().catch((error) => {
  console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
  process.exit(1);
});
