const { createTestServer } = require('../helpers/app');
const { createApiTestCase } = require('../helpers/apiTestCase');

describe('Health', () => {
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

  it('GET / returns hello message', async () => {
    await api.getJson('/')
      .then((r) => r.assertOk())
      .then((r) => r.assertExactJson({ message: 'Hello from orchestr-101' }));
  });

  it('GET /health returns status ok', async () => {
    await api.getJson('/health')
      .then((r) => r.assertOk())
      .then((r) => r.assertExactJson({ status: 'ok' }));
  });
});
