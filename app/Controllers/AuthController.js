const { UserService } = require('../Services/UserService');
const { ApiSerializer } = require('../Support/ApiSerializer');
const { Validator } = require('../Support/Validator');
const { getJwtService } = require('../Support/JwtService');
const { errorJson } = require('../Support/Http');

class AuthController {
  static async register(req, res) {
    const body = req.body || {};
    const error = Validator.firstError(body, {
      email: ['required', 'email', 'min:5', 'max:255'],
      password: ['required', 'string', 'min:8', 'max:128'],
    });
    if (error) {
      errorJson(res, error, 422);
      return;
    }

    const user = await UserService.create(String(body.email), String(body.password));
    res.status(201).json(ApiSerializer.user(user));
  }

  static async login(req, res) {
    let email = '';
    let password = '';

    if (req.isJson()) {
      const body = req.body || {};
      email = String(body.username || body.email || '');
      password = String(body.password || '');
    } else {
      const body = req.body || {};
      email = String(body.username || body.email || '');
      password = String(body.password || '');
    }

    if (!email || !password) {
      email = String(req.query.username || email);
      password = String(req.query.password || password);
    }

    const user = await UserService.authenticate(email, password);
    if (!user) {
      errorJson(res, 'Incorrect email or password', 401, null, { 'WWW-Authenticate': 'Bearer' });
      return;
    }

    res.json({
      access_token: getJwtService().createToken(user),
      token_type: 'bearer',
    });
  }

  static async me(req, res) {
    res.json(ApiSerializer.user(req.user));
  }
}

module.exports = { AuthController };
