const { ItemService } = require('../../Services/ItemService');
const { renderShopView } = require('../../Support/ViewRenderer');

class ShopHomeController {
  static async index(req, res) {
    const stats = await ItemService.getStats();
    await renderShopView(res, 'shop/home', { title: 'Home', stats });
  }
}

module.exports = { ShopHomeController };
