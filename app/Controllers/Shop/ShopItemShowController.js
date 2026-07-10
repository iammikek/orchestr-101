const { ItemService } = require('../../Services/ItemService');
const { renderShopView } = require('../../Support/ViewRenderer');

class ShopItemShowController {
  static async show(req, res) {
    const itemId = parseInt(req.routeParam('id'), 10);
    const row = await ItemService.getById(itemId);
    await renderShopView(res, 'shop/item-detail', {
      title: row.item.name,
      item: row.item,
      category: row.category,
    });
  }
}

module.exports = { ShopItemShowController };
