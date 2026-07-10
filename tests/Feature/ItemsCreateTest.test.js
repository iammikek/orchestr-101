const { createTestServer } = require('../helpers/app');
const { createApiTestCase } = require('../helpers/apiTestCase');

describe('Items create', () => {
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

  it('POST /items creates item', async () => {
    const token = await api.createAuthenticatedToken();
    const response = await api.withHeaders(api.bearerHeaders(token))
      .postJson('/items', {
        name: 'Widget',
        description: 'A nice widget',
        price: 9.99,
      });

    response.assertCreated();
    response.assertJsonPath('name', 'Widget');
    response.assertJsonPath('description', 'A nice widget');
    response.assertJsonPath('price', 9.99);
    expect(response.json().id).toBeGreaterThanOrEqual(1);
  });

  it('POST /items without auth is unauthorized', async () => {
    await api.postJson('/items', { name: 'Widget', price: 9.99 }).then((r) => r.assertUnauthorized());
  });

  it('GET /items/:id returns 404 when not found', async () => {
    await api.getJson('/items/99')
      .then((r) => r.assertNotFound())
      .then((r) => r.assertJsonPath('code', 'ITEM_NOT_FOUND'));
  });

  it('DELETE /items/:id deletes item', async () => {
    const token = await api.createAuthenticatedToken();
    const headers = api.bearerHeaders(token);

    const itemId = (await api.withHeaders(headers)
      .postJson('/items', { name: 'To Delete', price: 1.0 })).json().id;

    await api.withHeaders(headers)
      .deleteJson(`/items/${itemId}`)
      .then((r) => r.assertNoContent());

    await api.getJson(`/items/${itemId}`).then((r) => r.assertNotFound());
  });
});
