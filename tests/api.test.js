/**
 * API tests – mirror first-fastapi tests/test_main.py
 * Run: npm run test
 * Uses Vitest globals (describe, it, expect, beforeAll, afterAll, beforeEach).
 */
const { createTestServer, clearItems } = require('./helpers/app');

describe('API', () => {
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

  async function request(method, path, options = {}) {
    const url = client.baseUrl + path;
    const init = {
      method,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };
    if (options.body != null) init.body = JSON.stringify(options.body);
    const res = await fetch(url, init);
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: res.status, json, text };
  }

  it('GET / returns 200 and the hello message', async () => {
    const res = await request('GET', '/');
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ message: 'Hello from FastAPI!' });
  });

  it('GET /health returns 200 and status ok', async () => {
    const res = await request('GET', '/health');
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ status: 'ok' });
  });

  it('GET /items returns empty list when no items exist', async () => {
    const res = await request('GET', '/items');
    expect(res.status).toBe(200);
    expect(res.json).toEqual([]);
  });

  it('GET /items?skip=0&limit=2 returns only the requested slice', async () => {
    await request('POST', '/items', { body: { name: 'A', price: 1.0 } });
    await request('POST', '/items', { body: { name: 'B', price: 2.0 } });
    await request('POST', '/items', { body: { name: 'C', price: 3.0 } });
    const res = await request('GET', '/items?skip=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.json).toHaveLength(2);
    expect(res.json[0].name).toBe('B');
    expect(res.json[1].name).toBe('C');
  });

  it('POST /items creates an item and returns 201 with the created item', async () => {
    const res = await request('POST', '/items', {
      body: { name: 'Widget', description: 'A nice widget', price: 9.99 },
    });
    expect(res.status).toBe(201);
    expect(res.json.id).toBeGreaterThanOrEqual(1);
    expect(res.json.name).toBe('Widget');
    expect(res.json.description).toBe('A nice widget');
    expect(res.json.price).toBe(9.99);
  });

  it('POST /items accepts missing description (optional field)', async () => {
    const res = await request('POST', '/items', { body: { name: 'Thing', price: 5.0 } });
    expect(res.status).toBe(201);
    expect(res.json.description).toBeNull();
  });

  it('POST /items accepts category field', async () => {
    const res = await request('POST', '/items', {
      body: { name: 'Gadget', price: 15.0, category: 'Electronics' },
    });
    expect(res.status).toBe(201);
    expect(res.json.category).toBe('Electronics');
  });

  it('PATCH /items/:id can update category', async () => {
    const create = await request('POST', '/items', { body: { name: 'Item', price: 10.0 } });
    const itemId = create.json.id;
    const res = await request('PATCH', `/items/${itemId}`, { body: { category: 'Tools' } });
    expect(res.status).toBe(200);
    expect(res.json.category).toBe('Tools');
  });

  it('GET /items/:id returns the item when it exists', async () => {
    const create = await request('POST', '/items', {
      body: { name: 'Widget', description: null, price: 9.99 },
    });
    const itemId = create.json.id;
    const res = await request('GET', `/items/${itemId}`);
    expect(res.status).toBe(200);
    expect(res.json.name).toBe('Widget');
  });

  it('GET /items/:id returns 404 when item does not exist', async () => {
    const res = await request('GET', '/items/99');
    expect(res.status).toBe(404);
    expect(res.json.detail).toBe('Item not found');
  });

  it('POST /items returns 422 when required fields are missing', async () => {
    const res = await request('POST', '/items', { body: { name: 'No price' } });
    expect(res.status).toBe(422);
  });

  it('PATCH /items/:id updates only provided fields', async () => {
    const create = await request('POST', '/items', {
      body: { name: 'Widget', description: 'Original', price: 10.0 },
    });
    const itemId = create.json.id;
    const res = await request('PATCH', `/items/${itemId}`, { body: { price: 5.99 } });
    expect(res.status).toBe(200);
    expect(res.json.name).toBe('Widget');
    expect(res.json.description).toBe('Original');
    expect(res.json.price).toBe(5.99);
  });

  it('PATCH /items/:id can update all fields', async () => {
    const create = await request('POST', '/items', {
      body: { name: 'Old', description: null, price: 1.0 },
    });
    const itemId = create.json.id;
    const res = await request('PATCH', `/items/${itemId}`, {
      body: { name: 'New', description: 'Updated', price: 2.5 },
    });
    expect(res.status).toBe(200);
    expect(res.json.id).toBe(itemId);
    expect(res.json.name).toBe('New');
    expect(res.json.description).toBe('Updated');
    expect(res.json.price).toBe(2.5);
    expect(res.json).toHaveProperty('category');
  });

  it('PATCH /items/:id returns 404 when item does not exist', async () => {
    const res = await request('PATCH', '/items/99', { body: { name: 'Nope' } });
    expect(res.status).toBe(404);
    expect(res.json.detail).toBe('Item not found');
  });

  it('DELETE /items/:id deletes item when API key is valid', async () => {
    const create = await request('POST', '/items', { body: { name: 'To Delete', price: 1.0 } });
    const itemId = create.json.id;
    const res = await request('DELETE', `/items/${itemId}`, {
      headers: { 'X-API-Key': 'dev-key-123' },
    });
    expect(res.status).toBe(204);
    const getRes = await request('GET', `/items/${itemId}`);
    expect(getRes.status).toBe(404);
  });

  it('DELETE /items/:id returns 401 when API key is missing', async () => {
    const create = await request('POST', '/items', { body: { name: 'Test', price: 1.0 } });
    const itemId = create.json.id;
    const res = await request('DELETE', `/items/${itemId}`);
    expect(res.status).toBe(401);
    expect(res.json.detail).toBe('Invalid or missing API key');
  });

  it('DELETE /items/:id returns 401 when API key is invalid', async () => {
    const create = await request('POST', '/items', { body: { name: 'Test', price: 1.0 } });
    const itemId = create.json.id;
    const res = await request('DELETE', `/items/${itemId}`, {
      headers: { 'X-API-Key': 'wrong-key' },
    });
    expect(res.status).toBe(401);
    expect(res.json.detail).toBe('Invalid or missing API key');
  });

  it('DELETE /items/:id returns 404 when item does not exist', async () => {
    const res = await request('DELETE', '/items/99', {
      headers: { 'X-API-Key': 'dev-key-123' },
    });
    expect(res.status).toBe(404);
    expect(res.json.detail).toBe('Item not found');
  });

  it('GET /items/stats/summary returns stats for empty database', async () => {
    const res = await request('GET', '/items/stats/summary');
    expect(res.status).toBe(200);
    expect(res.json).toEqual({
      total_items: 0,
      average_price: 0.0,
      min_price: null,
      max_price: null,
    });
  });

  it('GET /items/stats/summary returns statistics about items', async () => {
    await request('POST', '/items', { body: { name: 'A', price: 10.0 } });
    await request('POST', '/items', { body: { name: 'B', price: 20.0 } });
    await request('POST', '/items', { body: { name: 'C', price: 30.0 } });
    const res = await request('GET', '/items/stats/summary');
    expect(res.status).toBe(200);
    expect(res.json.total_items).toBe(3);
    expect(res.json.average_price).toBe(20.0);
    expect(res.json.min_price).toBe(10.0);
    expect(res.json.max_price).toBe(30.0);
  });
});
