const { createTestServer } = require('../helpers/app');
const { createApiTestCase } = require('../helpers/apiTestCase');

describe('Categories', () => {
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

  it('POST /categories creates category', async () => {
    const token = await api.createAuthenticatedToken();
    const response = await api.withHeaders(api.bearerHeaders(token))
      .postJson('/categories', { name: 'Tools', description: 'Hand tools' });

    response.assertCreated();
    expect(response.json().id).toBeGreaterThanOrEqual(1);
    response.assertJsonPath('name', 'Tools');
    response.assertJsonPath('description', 'Hand tools');
  });

  it('POST /categories without auth is unauthorized', async () => {
    await api.postJson('/categories', { name: 'Tools' }).then((r) => r.assertUnauthorized());
  });

  it('POST /categories rejects duplicate name', async () => {
    const token = await api.createAuthenticatedToken();
    const headers = api.bearerHeaders(token);

    await api.withHeaders(headers).postJson('/categories', { name: 'foo' }).then((r) => r.assertCreated());
    await api.withHeaders(headers)
      .postJson('/categories', { name: 'foo', description: 'duplicate' })
      .then((r) => r.assertStatus(409))
      .then((r) => r.assertJsonPath('code', 'CATEGORY_NAME_EXISTS'));
  });

  it('GET /categories lists categories', async () => {
    const token = await api.createAuthenticatedToken();
    const headers = api.bearerHeaders(token);

    await api.withHeaders(headers).postJson('/categories', { name: 'Books' }).then((r) => r.assertCreated());

    await api.getJson('/categories')
      .then((r) => r.assertOk())
      .then((r) => r.assertJsonPath('total', 1))
      .then((r) => r.assertJsonPath('items.0.name', 'Books'));
  });
});
