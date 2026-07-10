const { getRawDb } = require('../helpers/db');
const { ItemNotFoundException } = require('../Exceptions/ItemNotFoundException');
const { CategoryService } = require('./CategoryService');

class ItemService {
  static async listItems(skip, limit, filters = {}) {
    const [where, params] = this.buildFilterClause(filters);
    const raw = await getRawDb();

    const countSql = `SELECT COUNT(*) as count FROM items i${where}`;
    const total = raw.prepare(countSql).get(...params).count;

    const sql = `SELECT i.*, c.id AS cat_id, c.name AS cat_name, c.description AS cat_description
      FROM items i
      LEFT JOIN categories c ON c.id = i.category_id
      ${where}
      ORDER BY i.id LIMIT ? OFFSET ?`;

    const rows = raw.prepare(sql).all(...params, limit, skip);
    return [rows.map((row) => this.hydrateItemRow(row)), total];
  }

  static async getById(itemId) {
    const raw = await getRawDb();
    const row = raw.prepare(
      `SELECT i.*, c.id AS cat_id, c.name AS cat_name, c.description AS cat_description
       FROM items i
       LEFT JOIN categories c ON c.id = i.category_id
       WHERE i.id = ?`,
    ).get(itemId);

    if (!row) throw new ItemNotFoundException(itemId);
    return this.hydrateItemRow(row);
  }

  static async create(name, description, price, categoryId) {
    if (categoryId != null) {
      await CategoryService.getById(categoryId);
    }

    const raw = await getRawDb();
    const result = raw.prepare(
      'INSERT INTO items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
    ).run(name, description, String(price), categoryId);

    return this.getById(Number(result.lastInsertRowid));
  }

  static async update(itemId, data) {
    const current = await this.getById(itemId);
    const item = { ...current.item };

    if (Object.prototype.hasOwnProperty.call(data, 'name') && data.name != null) {
      item.name = String(data.name);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      item.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'price') && data.price != null) {
      item.price = String(data.price);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'category_id')) {
      if (data.category_id == null) {
        item.category_id = null;
      } else {
        const category = await CategoryService.getById(Number(data.category_id));
        item.category_id = Number(category.id);
      }
    }

    const raw = await getRawDb();
    raw.prepare('UPDATE items SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?')
      .run(item.name, item.description, item.price, item.category_id, itemId);

    return this.getById(itemId);
  }

  static async delete(itemId) {
    await this.getById(itemId);
    const raw = await getRawDb();
    raw.prepare('DELETE FROM items WHERE id = ?').run(itemId);
  }

  static async getStats() {
    const raw = await getRawDb();
    const total = raw.prepare('SELECT COUNT(*) as count FROM items').get().count;

    if (total === 0) {
      return {
        total_items: 0,
        average_price: 0.0,
        min_price: null,
        max_price: null,
        uncategorized_count: 0,
        by_category: [],
      };
    }

    const aggregate = raw.prepare(
      'SELECT AVG(CAST(price AS REAL)) AS avg_price, MIN(CAST(price AS REAL)) AS min_price, MAX(CAST(price AS REAL)) AS max_price FROM items',
    ).get();

    const uncategorizedCount = raw.prepare(
      'SELECT COUNT(*) as count FROM items WHERE category_id IS NULL',
    ).get().count;

    const categoryRows = raw.prepare(
      `SELECT categories.id AS category_id, categories.name AS category_name,
              COUNT(items.id) AS item_count, AVG(CAST(items.price AS REAL)) AS average_price
       FROM items
       INNER JOIN categories ON categories.id = items.category_id
       GROUP BY categories.id, categories.name
       ORDER BY categories.name`,
    ).all();

    const byCategory = categoryRows.map((row) => ({
      category_id: Number(row.category_id),
      category_name: row.category_name,
      item_count: Number(row.item_count),
      average_price: Math.round(Number(row.average_price) * 100) / 100,
    }));

    return {
      total_items: total,
      average_price: Math.round(Number(aggregate.avg_price) * 100) / 100,
      min_price: Math.round(Number(aggregate.min_price) * 100) / 100,
      max_price: Math.round(Number(aggregate.max_price) * 100) / 100,
      uncategorized_count: uncategorizedCount,
      by_category: byCategory,
    };
  }

  static buildFilterClause(filters) {
    const clauses = [];
    const params = [];

    if (filters.min_price != null) {
      clauses.push('i.price >= ?');
      params.push(String(filters.min_price));
    }
    if (filters.max_price != null) {
      clauses.push('i.price <= ?');
      params.push(String(filters.max_price));
    }
    if (filters.category_id != null) {
      clauses.push('i.category_id = ?');
      params.push(Number(filters.category_id));
    }
    if (filters.name_contains != null) {
      clauses.push('LOWER(i.name) LIKE ?');
      params.push(`%${String(filters.name_contains).toLowerCase()}%`);
    }

    const where = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
    return [where, params];
  }

  static hydrateItemRow(row) {
    const item = {
      id: Number(row.id),
      name: row.name,
      description: row.description,
      price: row.price,
      category_id: row.category_id != null ? Number(row.category_id) : null,
    };

    let category = null;
    if (row.cat_id != null) {
      category = {
        id: Number(row.cat_id),
        name: row.cat_name,
        description: row.cat_description,
      };
    }

    return { item, category };
  }
}

module.exports = { ItemService };
