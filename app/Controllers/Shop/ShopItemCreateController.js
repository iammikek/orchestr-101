const { ItemService } = require('../../Services/ItemService');
const { CategoryService } = require('../../Services/CategoryService');
const { Session } = require('../../Support/Session');
const { Validator } = require('../../Support/Validator');
const { getRawDb } = require('../../helpers/db');
const { renderShopView } = require('../../Support/ViewRenderer');

class ShopItemCreateController {
  static async handle(req, res) {
    if (req.isMethod('POST')) {
      const body = req.body || {};
      const error = Validator.firstError(body, {
        name: ['required', 'string', 'max:255'],
        description: ['nullable', 'string'],
        price: ['required', 'numeric', 'gt:0'],
        category_id: ['nullable', 'integer', 'min:1'],
      });
      if (error) {
        Session.setOldInput(body);
        await renderShopView(res, 'shop/item-form', {
          pageTitle: 'Add item',
          title: 'Add item',
          categories: await CategoryService.listAllOrderedByName(),
        });
        return;
      }

      const categoryId = body.category_id && body.category_id !== ''
        ? parseInt(body.category_id, 10)
        : null;

      if (categoryId != null && !(await ShopItemCreateController.categoryExists(categoryId))) {
        Session.setError('category_id', 'The selected category is invalid.');
        Session.setOldInput(body);
        await renderShopView(res, 'shop/item-form', {
          pageTitle: 'Add item',
          title: 'Add item',
          categories: await CategoryService.listAllOrderedByName(),
        });
        return;
      }

      const row = await ItemService.create(
        String(body.name),
        body.description || null,
        Number(body.price).toFixed(2),
        categoryId,
      );

      Session.flash('success', `Created "${row.item.name}".`);
      res.redirect(`/shop/items/${row.item.id}`);
      return;
    }

    await renderShopView(res, 'shop/item-form', {
      pageTitle: 'Add item',
      title: 'Add item',
      categories: await CategoryService.listAllOrderedByName(),
    });
  }

  static async categoryExists(categoryId) {
    const raw = await getRawDb();
    return !!raw.prepare('SELECT 1 FROM categories WHERE id = ? LIMIT 1').get(categoryId);
  }
}

module.exports = { ShopItemCreateController };
