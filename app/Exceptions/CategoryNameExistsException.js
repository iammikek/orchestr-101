const { DomainException } = require('./DomainException');

class CategoryNameExistsException extends DomainException {
  constructor(name) {
    super(`Category name '${name}' already exists`, 409, 'CATEGORY_NAME_EXISTS');
    this.name = name;
  }
}

module.exports = { CategoryNameExistsException };
