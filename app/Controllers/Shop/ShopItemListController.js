const { ItemService } = require('../../Services/ItemService');
const { CategoryService } = require('../../Services/CategoryService');
const { Session } = require('../../Support/Session');
const { renderShopView } = require('../../Support/ViewRenderer');

const PAGE_SIZE = 10;

class ShopItemListController {
  static async index(req, res) {
    const query = req.query || {};
    const filters = {};

    if (query.name_contains) filters.name_contains = query.name_contains;
    if (query.category_id) filters.category_id = parseInt(query.category_id, 10);
    if (query.min_price) filters.min_price = query.min_price;
    if (query.max_price) filters.max_price = query.max_price;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const [items, totalCount] = await ItemService.listItems(skip, PAGE_SIZE, filters);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    await renderShopView(res, 'shop/item-list', {
      title: 'Items',
      items,
      totalCount,
      page,
      totalPages,
      categories: await CategoryService.listAllOrderedByName(),
      filters: query,
    });
  }
}

module.exports = { ShopItemListController };
