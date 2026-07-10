const { Session } = require('../app/Support/Session');

function shopAuth(req, res, next) {
  if (!Session.user()) {
    res.redirect('/shop/login');
    return;
  }
  next();
}

module.exports = { shopAuth };
