const { Route } = require('@orchestr-sh/orchestr');
const { routeHandler } = require('../app/Support/handleRequest');
const { HealthController } = require('../app/Controllers/HealthController');
const { AuthController } = require('../app/Controllers/AuthController');
const { CategoryController } = require('../app/Controllers/CategoryController');
const { ItemController } = require('../app/Controllers/ItemController');
const { jwtAuth } = require('../middleware/jwtAuth');
const openapi = require('../openapi.json');

function registerRoutes() {
  Route.get('/', routeHandler((req, res) => HealthController.root(req, res)));
  Route.get('/health', routeHandler((req, res) => HealthController.health(req, res)));

  Route.get('/openapi.json', (req, res) => {
    res.json(openapi);
  });

  Route.get('/docs', (req, res) => {
    const html = [
      '<!doctype html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8"/>',
      '<title>API Docs</title>',
      '<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>',
      '</head>',
      '<body>',
      '<div id="swagger-ui"></div>',
      '<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>',
      '<script>',
      'window.onload = function() {',
      "  SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });",
      '};',
      '</script>',
      '</body>',
      '</html>',
    ].join('');
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  Route.post('/auth/register', routeHandler((req, res) => AuthController.register(req, res)));
  Route.post('/auth/login', routeHandler((req, res) => AuthController.login(req, res)));

  const meRoute = Route.get('/auth/me', routeHandler((req, res) => AuthController.me(req, res)));
  meRoute.addMiddleware(jwtAuth);

  Route.get('/items/stats/summary', routeHandler((req, res) => ItemController.statsSummary(req, res)));
  Route.get('/items', routeHandler((req, res) => ItemController.index(req, res)));
  Route.get('/items/:item_id', routeHandler((req, res) => ItemController.show(req, res)));

  const storeItemRoute = Route.post('/items', routeHandler((req, res) => ItemController.store(req, res)));
  storeItemRoute.addMiddleware(jwtAuth);

  const updateItemRoute = Route.patch('/items/:item_id', routeHandler((req, res) => ItemController.update(req, res)));
  updateItemRoute.addMiddleware(jwtAuth);

  const deleteItemRoute = Route.delete('/items/:item_id', routeHandler((req, res) => ItemController.destroy(req, res)));
  deleteItemRoute.addMiddleware(jwtAuth);

  Route.get('/categories', routeHandler((req, res) => CategoryController.index(req, res)));
  Route.get('/categories/:category_id', routeHandler((req, res) => CategoryController.show(req, res)));

  const storeCategoryRoute = Route.post('/categories', routeHandler((req, res) => CategoryController.store(req, res)));
  storeCategoryRoute.addMiddleware(jwtAuth);

  const updateCategoryRoute = Route.patch('/categories/:category_id', routeHandler((req, res) => CategoryController.update(req, res)));
  updateCategoryRoute.addMiddleware(jwtAuth);

  const deleteCategoryRoute = Route.delete('/categories/:category_id', routeHandler((req, res) => CategoryController.destroy(req, res)));
  deleteCategoryRoute.addMiddleware(jwtAuth);
}

module.exports = { registerRoutes };
