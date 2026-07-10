const { DomainException } = require('./DomainException');

class UserEmailExistsException extends DomainException {
  constructor(email) {
    super(`User email '${email}' already exists`, 409, 'USER_EMAIL_EXISTS');
    this.email = email;
  }
}

module.exports = { UserEmailExistsException };
