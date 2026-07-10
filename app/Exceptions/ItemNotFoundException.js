const { DomainException } = require('./DomainException');

class ItemNotFoundException extends DomainException {
  constructor(itemId) {
    super('Item not found', 404, 'ITEM_NOT_FOUND');
    this.itemId = itemId;
  }
}

module.exports = { ItemNotFoundException };
