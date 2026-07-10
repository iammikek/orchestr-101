const { UserService } = require('../../Services/UserService');
const { Session } = require('../../Support/Session');
const { Validator } = require('../../Support/Validator');
const { renderShopView } = require('../../Support/ViewRenderer');

class ShopRegisterController {
  static async handle(req, res) {
    if (Session.isLoggedIn()) {
      res.redirect('/shop');
      return;
    }

    if (req.isMethod('POST')) {
      const body = req.body || {};
      const error = Validator.firstError(body, {
        email: ['required', 'email', 'max:255'],
        password: ['required', 'string', 'min:8', 'confirmed'],
      });
      if (error) {
        Session.setError('email', error);
        Session.setOldInput({ email: body.email || '' });
        await renderShopView(res, 'shop/register', { title: 'Create account' });
        return;
      }

      try {
        const user = await UserService.create(String(body.email), String(body.password));
        Session.login(user);
        Session.flash('success', 'Account created. You are logged in.');
        res.redirect('/shop');
      } catch (err) {
        if (err.code === 'USER_EMAIL_EXISTS') {
          Session.setError('email', 'An account with this email already exists.');
          Session.setOldInput({ email: body.email || '' });
          await renderShopView(res, 'shop/register', { title: 'Create account' });
          return;
        }
        throw err;
      }
      return;
    }

    await renderShopView(res, 'shop/register', { title: 'Create account' });
  }
}

module.exports = { ShopRegisterController };
