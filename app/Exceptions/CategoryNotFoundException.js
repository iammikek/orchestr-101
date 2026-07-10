const { DomainException } = require('./DomainException');

class CategoryNotFoundException extends DomainException {
  constructor(categoryId) {
    super('Category not found', 404, 'CATEGORY_NOT_FOUND');
    this.categoryId = categoryId;
  }
}

module.exports = { CategoryNotFoundException };
