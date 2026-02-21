const { getRawDb } = require('../helpers/db');

/**
 * Service layer: business logic for items (replicates FastAPI ItemService.get_stats)
 */
class ItemService {
  static async getStats() {
    const raw = await getRawDb();
    if (!raw) {
      return { total_items: 0, average_price: 0.0, min_price: null, max_price: null };
    }
    const row = raw.prepare(
      'SELECT COUNT(*) as total, AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price FROM items'
    ).get();
    const total = row?.total ?? 0;
    if (total === 0) {
      return { total_items: 0, average_price: 0.0, min_price: null, max_price: null };
    }
    return {
      total_items: total,
      average_price: row.avg_price != null ? Math.round(Number(row.avg_price) * 100) / 100 : null,
      min_price: row.min_price != null ? Number(row.min_price) : null,
      max_price: row.max_price != null ? Number(row.max_price) : null,
    };
  }
}

module.exports = { ItemService };
