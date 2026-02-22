/**
 * ItemService unit tests – business logic for item stats.
 * Uses test DB (same setup as api.test.js).
 */
const { createTestServer, clearItems } = require('./helpers/app');
const { Item } = require('../app/Models/Item');
const { ItemService } = require('../app/Services/ItemService');

describe('ItemService', () => {
  let client;

  beforeAll(async () => {
    client = await createTestServer();
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await clearItems(client.app);
  });

  describe('getStats', () => {
    it('returns zeros and nulls when no items exist', async () => {
      const stats = await ItemService.getStats();
      expect(stats).toEqual({
        total_items: 0,
        average_price: 0.0,
        min_price: null,
        max_price: null,
      });
    });

    it('returns correct stats when items exist', async () => {
      await Item.create({ name: 'A', price: 10.0 });
      await Item.create({ name: 'B', price: 20.0 });
      await Item.create({ name: 'C', price: 30.0 });

      const stats = await ItemService.getStats();
      expect(stats.total_items).toBe(3);
      expect(stats.average_price).toBe(20);
      expect(stats.min_price).toBe(10);
      expect(stats.max_price).toBe(30);
    });

    it('rounds average_price to two decimal places', async () => {
      await Item.create({ name: 'X', price: 10.0 });
      await Item.create({ name: 'Y', price: 11.0 });

      const stats = await ItemService.getStats();
      expect(stats.total_items).toBe(2);
      expect(stats.average_price).toBe(10.5);
    });
  });
});
