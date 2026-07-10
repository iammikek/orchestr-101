const { createTestServer } = require('../helpers/app');
const { createApiTestCase } = require('../helpers/apiTestCase');

describe('Auth', () => {
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

  it('POST /auth/register creates user', async () => {
    const response = await api.postJson('/auth/register', {
      email: 'alice@example.com',
      password: 'password123',
    });
    response.assertCreated();
    response.assertJsonPath('email', 'alice@example.com');
    expect(response.json()).not.toHaveProperty('password');
  });

  it('POST /auth/register rejects duplicate email', async () => {
    const payload = { email: 'test@example.com', password: 'secret123' };
    await api.postJson('/auth/register', payload).then((r) => r.assertCreated());
    await api.postJson('/auth/register', payload)
      .then((r) => r.assertStatus(409))
      .then((r) => r.assertJsonPath('code', 'USER_EMAIL_EXISTS'));
  });

  it('POST /auth/login returns bearer token', async () => {
    await api.postJson('/auth/register', {
      email: 'test@example.com',
      password: 'secret123',
    }).then((r) => r.assertCreated());

    const response = await api.post('/auth/login', {
      username: 'test@example.com',
      password: 'secret123',
    });
    response.assertOk();
    response.assertJsonPath('token_type', 'bearer');
    expect(response.json().access_token).toBeTruthy();
  });

  it('POST /auth/login rejects invalid password', async () => {
    await api.postJson('/auth/register', {
      email: 'test@example.com',
      password: 'secret123',
    }).then((r) => r.assertCreated());

    await api.post('/auth/login', {
      username: 'test@example.com',
      password: 'wrong-password',
    })
      .then((r) => r.assertUnauthorized())
      .then((r) => r.assertJsonPath('detail', 'Incorrect email or password'));
  });

  it('GET /auth/me returns current user', async () => {
    const token = await api.createAuthenticatedToken();
    await api.withHeaders(api.bearerHeaders(token))
      .getJson('/auth/me')
      .then((r) => r.assertOk())
      .then((r) => r.assertJsonPath('email', 'test@example.com'));
  });

  it('GET /auth/me without token is unauthorized', async () => {
    await api.getJson('/auth/me').then((r) => r.assertUnauthorized());
  });
});
