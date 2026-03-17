const { Route } = require('@orchestr-sh/orchestr');
const { ItemController } = require('../app/Controllers/ItemController');
const { verifyApiKey } = require('../middleware/verifyApiKey');
const openapi = require('../openapi.json');

function registerRoutes() {
  // Root
  Route.get('/', (req, res) => {
    res.json({ message: 'Hello from Orchestr!' });
  });

  // Health
  Route.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // OpenAPI spec
  Route.get('/openapi.json', (req, res) => {
    res.json(openapi);
  });

  // Swagger UI docs
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
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Items – delegate to ItemController
  Route.get('/items', (req, res) => ItemController.index(req, res));
  Route.get('/items/stats/summary', (req, res) => ItemController.statsSummary(req, res));
  Route.get('/items/:item_id', (req, res) => ItemController.show(req, res));
  Route.post('/items', (req, res) => ItemController.store(req, res));
  Route.patch('/items/:item_id', (req, res) => ItemController.update(req, res));

  const deleteItemRoute = Route.delete('/items/:item_id', (req, res) => ItemController.destroy(req, res));
  deleteItemRoute.addMiddleware(verifyApiKey);
}

module.exports = { registerRoutes };
