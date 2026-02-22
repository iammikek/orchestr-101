const { Ensemble } = require('@orchestr-sh/orchestr');

/**
 * Item model – Laravel-style Eloquent equivalent (id, name, description, price, category)
 */
class Item extends Ensemble {
  constructor(attributes, fromDatabase) {
    super(attributes, fromDatabase);
    this.table = 'items';
    this.fillable = ['name', 'description', 'price', 'category'];
    this.timestamps = false;
    // Parent constructor runs fill() before our fillable was set; fill again
    if (attributes && typeof attributes === 'object' && !fromDatabase) {
      this.fill(attributes);
    }
  }
}

module.exports = { Item };
