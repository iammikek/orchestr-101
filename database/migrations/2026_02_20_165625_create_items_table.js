const { Migration } = require('@orchestr-sh/orchestr');

module.exports = class extends Migration {
  async up(schema) {
    await schema.create('items', (table) => {
      table.id();
      table.string('name', 255);
      table.text('description').nullable();
      table.float('price');
      table.string('category', 100).nullable();
    });
  }

  async down(schema) {
    await schema.dropIfExists('items');
  }
};
