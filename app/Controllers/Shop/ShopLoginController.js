const { UserService } = require('../../Services/UserService');
const { Session } = require('../../Support/Session');
const { Validator } = require('../../Support/Validator');
const { renderShopView } = require('../../Support/ViewRenderer');

class ShopLoginController {
  static async handle(req, res) {
    if (Session.isLoggedIn()) {
      res.redirect('/shop');
      return;
    }

    if (req.isMethod('POST')) {
      const body = req.body || {};
      const error = Validator.firstError(body, {
        email: ['required', 'email'],
        password: ['required'],
      });
      if (error) {
        Session.setError('email', 'Invalid credentials.');
        Session.setOldInput({ email: body.email || '' });
        await renderShopView(res, 'shop/login', { title: 'Log in' });
        return;
      }

      const user = await UserService.authenticate(String(body.email), String(body.password));
      if (!user) {
        Session.setError('email', 'Invalid credentials.');
        Session.setOldInput({ email: body.email || '' });
        await renderShopView(res, 'shop/login', { title: 'Log in' });
        return;
      }

      Session.login(user);
      res.redirect('/shop');
      return;
    }

    await renderShopView(res, 'shop/login', { title: 'Log in' });
  }
}

module.exports = { ShopLoginController };
