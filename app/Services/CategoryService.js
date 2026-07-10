const { getRawDb } = require('../helpers/db');
const { CategoryNotFoundException } = require('../Exceptions/CategoryNotFoundException');
const { CategoryNameExistsException } = require('../Exceptions/CategoryNameExistsException');
const { CategoryInUseException } = require('../Exceptions/CategoryInUseException');

class CategoryService {
  static async listCategories(skip, limit) {
    const raw = await getRawDb();
    const total = raw.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const rows = raw.prepare('SELECT * FROM categories ORDER BY id LIMIT ? OFFSET ?').all(limit, skip);
    return [rows, total];
  }

  static async listAllOrderedByName() {
    const raw = await getRawDb();
    return raw.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  static async getById(categoryId) {
    const raw = await getRawDb();
    const category = raw.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!category) throw new CategoryNotFoundException(categoryId);
    return category;
  }

  static async create(name, description) {
    await this.ensureUniqueName(name);
    const raw = await getRawDb();
    const result = raw.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description);
    return this.getById(Number(result.lastInsertRowid));
  }

  static async update(categoryId, data) {
    const category = await this.getById(categoryId);

    if (Object.prototype.hasOwnProperty.call(data, 'name') && data.name != null) {
      await this.ensureUniqueName(String(data.name), categoryId);
      category.name = String(data.name);
    }

    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      category.description = data.description;
    }

    const raw = await getRawDb();
    raw.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?')
      .run(category.name, category.description, categoryId);

    return this.getById(categoryId);
  }

  static async delete(categoryId) {
    const category = await this.getById(categoryId);
    const raw = await getRawDb();
    const inUse = raw.prepare('SELECT 1 FROM items WHERE category_id = ? LIMIT 1').get(category.id);
    if (inUse) throw new CategoryInUseException(categoryId);
    raw.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
  }

  static async ensureUniqueName(name, excludeId = null) {
    const raw = await getRawDb();
    let exists;
    if (excludeId != null) {
      exists = raw.prepare('SELECT 1 FROM categories WHERE name = ? AND id != ? LIMIT 1').get(name, excludeId);
    } else {
      exists = raw.prepare('SELECT 1 FROM categories WHERE name = ? LIMIT 1').get(name);
    }
    if (exists) throw new CategoryNameExistsException(name);
  }
}

module.exports = { CategoryService };
