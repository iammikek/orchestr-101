const jwt = require('jsonwebtoken');

class JwtService {
  constructor(secret) {
    this.secret = secret;
  }

  createToken(user) {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
      {
        sub: Number(user.id),
        email: user.email,
        iat: now,
        exp: now + 3600,
      },
      this.secret,
      { algorithm: 'HS256' },
    );
  }

  decodeToken(token) {
    try {
      const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      return {
        sub: Number(payload.sub),
        email: String(payload.email),
      };
    } catch {
      return null;
    }
  }
}

let instance = null;

function getJwtService() {
  if (!instance) {
    const { getApp } = require('../appInstance');
    const app = getApp();
    const secret = app?.make('config')?.get('app.jwt_secret', 'change-me-in-production')
      || process.env.JWT_SECRET
      || 'change-me-in-production';
    instance = new JwtService(secret);
  }
  return instance;
}

module.exports = { JwtService, getJwtService };
