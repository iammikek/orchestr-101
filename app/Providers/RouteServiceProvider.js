/**
 * Route Service Provider
 *
 * Loads application route files. Pattern from orchestr-sh-skeleton.
 */

const { RouteServiceProvider: BaseRouteServiceProvider } = require('@orchestr-sh/orchestr');

class RouteServiceProvider extends BaseRouteServiceProvider {
  async boot() {
    const { registerRoutes } = require('../../routes/api');
    registerRoutes();
  }
}

module.exports = { RouteServiceProvider };
