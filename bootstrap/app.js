/**
 * Application Bootstrap
 *
 * Creates and configures the application with service providers and config.
 * Pattern from orchestr-sh-skeleton.
 */

require('reflect-metadata');

const {
  Application,
  ConfigServiceProvider,
  DatabaseServiceProvider,
  Facade,
} = require('@orchestr-sh/orchestr');

const config = require('../config');
const { setApp } = require('../app/appInstance');
const { AppServiceProvider } = require('../app/Providers/AppServiceProvider');
const { RouteServiceProvider } = require('../app/Providers/RouteServiceProvider');

/**
 * Create and configure the application
 */
function createApp() {
  const app = new Application(process.cwd());

  Facade.setFacadeApplication(app);
  setApp(app);

  app.register(new ConfigServiceProvider(app, config));
  app.register(new DatabaseServiceProvider(app));

  app.register(new AppServiceProvider(app));
  app.register(new RouteServiceProvider(app));

  return app;
}

module.exports = { createApp };
module.exports.default = createApp;
