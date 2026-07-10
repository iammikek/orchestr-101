const { createTestServer } = require('../helpers/app');
const { createApiTestCase } = require('../helpers/apiTestCase');

describe('Shop', () => {
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

  it('GET /shop renders home page', async () => {
    await api.get('/shop')
      .then((r) => r.assertOk())
      .then((r) => r.assertSee('Catalog Shop'))
      .then((r) => r.assertSee('Full-stack Orchestr'));
  });

  it('GET /shop/items shows empty state', async () => {
    await api.get('/shop/items')
      .then((r) => r.assertOk())
      .then((r) => r.assertSee('No items match'));
  });

  it('GET /shop/items/:id shows item detail', async () => {
    const token = await api.createAuthenticatedToken();
    const itemId = (await api.withHeaders(api.bearerHeaders(token))
      .postJson('/items', { name: 'Shop Widget', price: 9.99 })).json().id;

    await api.get(`/shop/items/${itemId}`)
      .then((r) => r.assertOk())
      .then((r) => r.assertSee('Shop Widget'));
  });

  it('GET /shop/items/new requires login', async () => {
    await api.get('/shop/items/new').then((r) => r.assertRedirect('/shop/login'));
  });

  it('POST /shop/items/new creates item via form', async () => {
    const user = await api.createShopUser();

    await api.actingAs(user)
      .get('/shop/items/new')
      .then((r) => r.assertOk());

    const response = await api.actingAs(user).post('/shop/items/new', {
      name: 'Browser Widget',
      description: 'Added via HTML form',
      price: '12.50',
    });

    response.assertRedirect();
    await api.followRedirects(response).then((r) => r.assertSee('Browser Widget'));
  });

  it('GET /shop/login renders login page', async () => {
    const user = await api.createShopUserEntity();

    await api.get('/shop/login')
      .then((r) => r.assertOk())
      .then((r) => r.assertSee('Browser session auth'));

    await api.post('/shop/login', {
      email: user.email,
      password: 'secret123',
    }).then((r) => r.assertRedirect('/shop'));
  });

  it('GET /shop/register renders register page', async () => {
    await api.get('/shop/register')
      .then((r) => r.assertOk())
      .then((r) => r.assertSee('Create account'));
  });

  it('POST /shop/register creates user and logs in', async () => {
    await api.post('/shop/register', {
      email: 'newshopper@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    }).then((r) => r.assertRedirect('/shop'));

    api.assertAuthenticatedAs({ email: 'newshopper@example.com' });
  });

  it('POST /shop/register shows duplicate email error', async () => {
    await api.createShopUserEntity();

    await api.post('/shop/register', {
      email: 'shopper@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    })
      .then((r) => r.assertOk())
      .then((r) => r.assertSee('already exists'));
  });
});
