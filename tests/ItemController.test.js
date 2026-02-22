/**
 * ItemController unit tests – resource controller with mocked req/res.
 * Uses test DB and real Item model; exercises controller logic and responses.
 */
const { createTestServer, clearItems } = require('./helpers/app');
const { Item } = require('../app/Models/Item');
const { ItemController } = require('../app/Controllers/ItemController');

function mockRes() {
  const out = {
    _status: null,
    _json: null,
    _sent: false,
    status(code) {
      this._status = code;
      return this;
    },
    json(data) {
      this._json = data;
      return this;
    },
    send() {
      this._sent = true;
      return this;
    },
  };
  return out;
}

function mockReq(overrides = {}) {
  return {
    query: {},
    body: {},
    routeParam: () => undefined,
    parseBody: async () => {},
    ...overrides,
  };
}

describe('ItemController', () => {
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

  describe('index', () => {
    it('returns empty array when no items', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      await ItemController.index(req, res);
      expect(res._json).toEqual([]);
    });

    it('respects skip and limit', async () => {
      await Item.create({ name: 'A', price: 1 });
      await Item.create({ name: 'B', price: 2 });
      await Item.create({ name: 'C', price: 3 });
      const req = mockReq({ query: { skip: '1', limit: '2' } });
      const res = mockRes();
      await ItemController.index(req, res);
      expect(res._json).toHaveLength(2);
      expect(res._json[0].name).toBe('B');
      expect(res._json[1].name).toBe('C');
    });
  });

  describe('show', () => {
    it('returns item when it exists', async () => {
      const row = await Item.create({ name: 'Widget', price: 9.99 });
      const id = row.getAttribute('id');
      const req = mockReq({ routeParam: (name) => (name === 'item_id' ? String(id) : undefined) });
      const res = mockRes();
      await ItemController.show(req, res);
      expect(res._json.name).toBe('Widget');
      expect(res._json.price).toBe(9.99);
    });

    it('returns 404 when item does not exist', async () => {
      const req = mockReq({ routeParam: () => '999' });
      const res = mockRes();
      await ItemController.show(req, res);
      expect(res._status).toBe(404);
      expect(res._json.detail).toBe('Item not found');
    });
  });

  describe('store', () => {
    it('creates item and returns 201', async () => {
      const req = mockReq({
        body: { name: 'New Item', description: 'Desc', price: 12.5 },
        parseBody: async () => {},
      });
      const res = mockRes();
      await ItemController.store(req, res);
      expect(res._status).toBe(201);
      expect(res._json.name).toBe('New Item');
      expect(res._json.description).toBe('Desc');
      expect(res._json.price).toBe(12.5);
      expect(res._json.id).toBeGreaterThanOrEqual(1);
    });

    it('returns 422 when name and price are missing', async () => {
      const req = mockReq({ body: {}, parseBody: async () => {} });
      const res = mockRes();
      await ItemController.store(req, res);
      expect(res._status).toBe(422);
      expect(res._json.detail).toBe('name and price are required');
    });
  });

  describe('statsSummary', () => {
    it('returns stats from ItemService', async () => {
      await Item.create({ name: 'A', price: 10 });
      await Item.create({ name: 'B', price: 20 });
      const req = mockReq();
      const res = mockRes();
      await ItemController.statsSummary(req, res);
      expect(res._json.total_items).toBe(2);
      expect(res._json.average_price).toBe(15);
      expect(res._json.min_price).toBe(10);
      expect(res._json.max_price).toBe(20);
    });
  });

  describe('update', () => {
    it('updates item and returns updated', async () => {
      const row = await Item.create({ name: 'Old', price: 5 });
      const id = row.getAttribute('id');
      const req = mockReq({
        routeParam: () => String(id),
        body: { name: 'Updated', price: 15 },
        parseBody: async () => {},
      });
      const res = mockRes();
      await ItemController.update(req, res);
      expect(res._json.name).toBe('Updated');
      expect(res._json.price).toBe(15);
    });
  });

  describe('destroy', () => {
    it('deletes item and returns 204', async () => {
      const row = await Item.create({ name: 'ToDelete', price: 1 });
      const id = row.getAttribute('id');
      const req = mockReq({ routeParam: () => String(id) });
      const res = mockRes();
      await ItemController.destroy(req, res);
      expect(res._status).toBe(204);
      expect(res._sent).toBe(true);
      const found = await Item.find(id);
      expect(found).toBeNull();
    });

    it('returns 404 when item does not exist', async () => {
      const req = mockReq({ routeParam: () => '999' });
      const res = mockRes();
      await ItemController.destroy(req, res);
      expect(res._status).toBe(404);
    });
  });
});
