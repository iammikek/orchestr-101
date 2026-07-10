const { DomainException } = require('./DomainException');

class CategoryInUseException extends DomainException {
  constructor(categoryId) {
    super('Category has items and cannot be deleted', 409, 'CATEGORY_IN_USE');
    this.categoryId = categoryId;
  }
}

module.exports = { CategoryInUseException };
