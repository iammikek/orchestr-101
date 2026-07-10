class DomainException extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'DomainException';
    this.status = status;
    this.code = code;
  }
}

module.exports = { DomainException };
