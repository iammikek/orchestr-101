/**
 * Application Service Provider
 *
 * Register and bootstrap application services. Pattern from orchestr-sh-skeleton.
 */

const { ServiceProvider, Ensemble } = require('@orchestr-sh/orchestr');

class AppServiceProvider extends ServiceProvider {
  register() {
    //
  }

  async boot() {
    const db = this.app.make('db');
    Ensemble.setConnectionResolver(db);
  }
}

module.exports = { AppServiceProvider };
