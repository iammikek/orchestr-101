const { Session } = require('../../Support/Session');

class ShopLogoutController {
  static handle(req, res) {
    Session.logout();
    res.redirect('/shop');
  }
}

module.exports = { ShopLogoutController };
