const { createTestServer } = require('../helpers/app');
const { createApiTestCase } = require('../helpers/apiTestCase');

describe('Items list', () => {
  let server;
  let api;

  beforeAll(async () => {
    server = await createTestServer();
    api = createApiTestCase(server);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    api.resetHeaders();
    await server.resetTables();
  });

  it('GET /items returns empty paginated list', async () => {
    await api.getJson('/items')
      .then((r) => r.assertOk())
      .then((r) => r.assertExactJson({
        items: [],
        total: 0,
        skip: 0,
        limit: 10,
      }));
  });

  it('GET /items supports pagination', async () => {
    const token = await api.createAuthenticatedToken();
    const headers = api.bearerHeaders(token);

    for (const [name, price] of [['A', 1.0], ['B', 2.0], ['C', 3.0]]) {
      await api.withHeaders(headers).postJson('/items', { name, price }).then((r) => r.assertCreated());
    }

    const response = await api.getJson('/items?skip=1&limit=2');
    response.assertOk();
    response.assertJsonPath('total', 3);
    response.assertJsonPath('skip', 1);
    response.assertJsonPath('limit', 2);
    response.assertJsonCount(2, 'items');
    response.assertJsonPath('items.0.name', 'B');
    response.assertJsonPath('items.1.name', 'C');
  });

  it('GET /items returns 422 for invalid limit', async () => {
    await api.getJson('/items?limit=101').then((r) => r.assertStatus(422));
  });
});
