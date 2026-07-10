const { Migration } = require('@orchestr-sh/orchestr');

module.exports = class extends Migration {
  async up(schema) {
    await schema.create('users', (table) => {
      table.id();
      table.string('email', 255).unique();
      table.string('password', 255);
    });
  }

  async down(schema) {
    await schema.dropIfExists('users');
  }
};
