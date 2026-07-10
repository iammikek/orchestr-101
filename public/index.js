/**
 * HTTP Entry Point
 */

const { Kernel } = require('@orchestr-sh/orchestr');
const { createApp } = require('../bootstrap/app');
const { sessionMiddleware } = require('../middleware/session');
const { exceptionHandler } = require('../middleware/exceptionHandler');

async function runMigrations(app) {
  const { AppConsoleKernel } = require('../app/Console/Kernel');
  const kernel = new AppConsoleKernel(app);
  await kernel.run(['node', 'bootstrap/cli.js', 'migrate']);
}

async function main() {
  const app = createApp();
  await app.boot();
  await runMigrations(app);

  const kernel = new Kernel(app);
  kernel.use(sessionMiddleware);
  kernel.use(exceptionHandler);

  const config = app.make('config');
  const port = config.get('app.port', 8005);
  const host = config.get('app.host', '127.0.0.1');

  kernel.listen(port, host, () => {
    console.log(`\x1b[32m[Orchestr]\x1b[0m Server running at http://${host}:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
