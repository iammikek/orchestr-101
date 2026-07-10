const { Route } = require('@orchestr-sh/orchestr');
const { routeHandler } = require('../app/Support/handleRequest');
const { ShopHomeController } = require('../app/Controllers/Shop/ShopHomeController');
const { ShopStyleController } = require('../app/Controllers/Shop/ShopStyleController');
const { ShopLoginController } = require('../app/Controllers/Shop/ShopLoginController');
const { ShopRegisterController } = require('../app/Controllers/Shop/ShopRegisterController');
const { ShopLogoutController } = require('../app/Controllers/Shop/ShopLogoutController');
const { ShopItemListController } = require('../app/Controllers/Shop/ShopItemListController');
const { ShopItemShowController } = require('../app/Controllers/Shop/ShopItemShowController');
const { ShopItemCreateController } = require('../app/Controllers/Shop/ShopItemCreateController');
const { shopAuth } = require('../middleware/shopAuth');

function registerWebRoutes() {
  Route.get('/shop/style.css', (req, res) => ShopStyleController.index(req, res));

  Route.get('/shop', routeHandler((req, res) => ShopHomeController.index(req, res)));
  Route.match(['GET', 'POST'], '/shop/login', routeHandler((req, res) => ShopLoginController.handle(req, res)));
  Route.post('/shop/logout', routeHandler((req, res) => ShopLogoutController.handle(req, res)));
  Route.match(['GET', 'POST'], '/shop/register', routeHandler((req, res) => ShopRegisterController.handle(req, res)));

  Route.get('/shop/items', routeHandler((req, res) => ShopItemListController.index(req, res)));

  const newItemGet = Route.get('/shop/items/new', routeHandler((req, res) => ShopItemCreateController.handle(req, res)));
  newItemGet.addMiddleware(shopAuth);

  const newItemPost = Route.post('/shop/items/new', routeHandler((req, res) => ShopItemCreateController.handle(req, res)));
  newItemPost.addMiddleware(shopAuth);

  Route.get('/shop/items/:id', routeHandler((req, res) => ShopItemShowController.show(req, res)));
}

module.exports = { registerWebRoutes };
