const bcrypt = require('bcryptjs');
const { getRawDb } = require('../helpers/db');
const { UserEmailExistsException } = require('../Exceptions/UserEmailExistsException');

class UserService {
  static async getByEmail(email) {
    const raw = await getRawDb();
    if (!raw) return null;
    return raw.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
  }

  static async getById(id) {
    const raw = await getRawDb();
    if (!raw) return null;
    return raw.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
  }

  static async create(email, password) {
    if (await this.getByEmail(email)) {
      throw new UserEmailExistsException(email);
    }

    const hash = await bcrypt.hash(password, 10);
    const raw = await getRawDb();
    const result = raw.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hash);

    return {
      id: Number(result.lastInsertRowid),
      email,
      password: hash,
    };
  }

  static async authenticate(email, password) {
    const user = await this.getByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? user : null;
  }
}

module.exports = { UserService };
