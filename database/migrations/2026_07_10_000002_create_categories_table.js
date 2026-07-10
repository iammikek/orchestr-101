const { Migration } = require('@orchestr-sh/orchestr');

module.exports = class extends Migration {
  async up(schema) {
    await schema.create('categories', (table) => {
      table.id();
      table.string('name', 100).unique();
      table.text('description').nullable();
    });
  }

  async down(schema) {
    await schema.dropIfExists('categories');
  }
};
