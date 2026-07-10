/**
 * Route Service Provider
 */

const { RouteServiceProvider: BaseRouteServiceProvider } = require('@orchestr-sh/orchestr');

class RouteServiceProvider extends BaseRouteServiceProvider {
  async boot() {
    const { registerRoutes } = require('../../routes/api');
    const { registerWebRoutes } = require('../../routes/web');
    registerRoutes();
    registerWebRoutes();
  }
}

module.exports = { RouteServiceProvider };
