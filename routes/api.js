const { Route } = require('@orchestr-sh/orchestr');
const { ItemController } = require('../app/Controllers/ItemController');
const { verifyApiKey } = require('../middleware/verifyApiKey');

function registerRoutes() {
  // Root
  Route.get('/', (req, res) => {
    res.json({ message: 'Hello from Orchestr!' });
  });

  // Health
  Route.get('/health', (req, res) => {
    res.json({ status: 'ok' });
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
