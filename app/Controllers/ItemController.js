const { ItemService } = require('../Services/ItemService');
const { ApiSerializer } = require('../Support/ApiSerializer');
const { Validator } = require('../Support/Validator');
const { errorJson } = require('../Support/Http');

class ItemController {
  static async index(req, res) {
    const skip = req.query.skip !== undefined ? parseInt(req.query.skip, 10) : 0;
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : 10;

    const validationData = {
      skip,
      limit,
      min_price: req.query.min_price ?? null,
      max_price: req.query.max_price ?? null,
      category_id: req.query.category_id ?? null,
      name_contains: req.query.name_contains ?? null,
    };

    const error = Validator.firstError(validationData, {
      skip: ['integer', 'min:0'],
      limit: ['integer', 'min:1', 'max:100'],
      min_price: ['nullable', 'numeric', 'gt:0'],
      max_price: ['nullable', 'numeric', 'gt:0'],
      category_id: ['nullable', 'integer', 'min:1'],
      name_contains: ['nullable', 'string', 'min:1', 'max:255'],
    });
    if (error) {
      errorJson(res, error, 422);
      return;
    }

    const safeSkip = Math.max(0, skip);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const filters = {};
    if (req.query.min_price != null) filters.min_price = req.query.min_price;
    if (req.query.max_price != null) filters.max_price = req.query.max_price;
    if (req.query.category_id != null) filters.category_id = parseInt(req.query.category_id, 10);
    if (req.query.name_contains != null) filters.name_contains = req.query.name_contains;

    const [rows, total] = await ItemService.listItems(safeSkip, safeLimit, filters);
    res.json({
      items: rows.map((row) => ApiSerializer.item(row.item, row.category)),
      total,
      skip: safeSkip,
      limit: safeLimit,
    });
  }

  static async show(req, res) {
    const itemId = parseInt(req.routeParam('item_id'), 10);
    const row = await ItemService.getById(itemId);
    res.json(ApiSerializer.item(row.item, row.category));
  }

  static async store(req, res) {
    const body = req.body || {};
    const error = Validator.firstError(body, {
      name: ['required', 'string', 'min:1', 'max:255'],
      description: ['nullable', 'string'],
      price: ['required', 'numeric', 'gt:0'],
      category_id: ['nullable', 'integer', 'min:1'],
    });
    if (error) {
      errorJson(res, error, 422);
      return;
    }

    const row = await ItemService.create(
      String(body.name),
      body.description ?? null,
      Number(body.price).toFixed(2),
      body.category_id != null ? parseInt(body.category_id, 10) : null,
    );
    res.status(201).json(ApiSerializer.item(row.item, row.category));
  }

  static async update(req, res) {
    const itemId = parseInt(req.routeParam('item_id'), 10);
    const body = req.body || {};
    const row = await ItemService.update(itemId, body);
    res.json(ApiSerializer.item(row.item, row.category));
  }

  static async destroy(req, res) {
    const itemId = parseInt(req.routeParam('item_id'), 10);
    await ItemService.delete(itemId);
    res.status(204).send();
  }

  static async statsSummary(req, res) {
    const stats = await ItemService.getStats();
    res.json(stats);
  }
}

module.exports = { ItemController };
