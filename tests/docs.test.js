const { describe, it, expect, beforeAll, afterAll } = require('vitest');
const { createTestServer } = require('./helpers/app');

let client;

describe('Docs', () => {
  beforeAll(async () => {
    client = await createTestServer();
  });

  afterAll(async () => {
    if (client && client.close) {
      await client.close();
    }
  });

  it('serves /docs with Swagger UI', async () => {
    const res = await fetch(`${client.baseUrl}/docs`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('SwaggerUIBundle');
    expect(text).toContain('/openapi.json');
  });
});
