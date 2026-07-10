const { Migration } = require('@orchestr-sh/orchestr');

module.exports = class extends Migration {
  async up(schema) {
    await schema.create('items', (table) => {
      table.id();
      table.string('name', 255);
      table.text('description').nullable();
      table.string('price', 32);
      table.integer('category_id').nullable();
      table.foreign('category_id').references('categories.id').onDelete('set null');
    });
  }

  async down(schema) {
    await schema.dropIfExists('items');
  }
};
