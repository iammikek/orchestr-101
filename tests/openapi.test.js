const { createTestServer } = require('./helpers/app');

let client;

describe('OpenAPI', () => {
  beforeAll(async () => {
    client = await createTestServer();
  });

  afterAll(async () => {
    if (client && client.close) {
      await client.close();
    }
  });

  it('serves /openapi.json with basic structure', async () => {
    const res = await fetch(`${client.baseUrl}/openapi.json`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.openapi).toBe('3.0.3');
    expect(json.info && json.info.title).toBe('Orchestr 101 API');
    expect(json.paths && json.paths['/items']).toBeTruthy();
  });
});
