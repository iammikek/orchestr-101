const { CategoryService } = require('../Services/CategoryService');
const { ApiSerializer } = require('../Support/ApiSerializer');
const { Validator } = require('../Support/Validator');
const { errorJson } = require('../Support/Http');

class CategoryController {
  static async index(req, res) {
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const [rows, total] = await CategoryService.listCategories(skip, limit);

    res.json({
      items: rows.map((row) => ApiSerializer.category(row)),
      total,
      skip,
      limit,
    });
  }

  static async show(req, res) {
    const categoryId = parseInt(req.routeParam('category_id'), 10);
    const category = await CategoryService.getById(categoryId);
    res.json(ApiSerializer.category(category));
  }

  static async store(req, res) {
    const body = req.body || {};
    const error = Validator.firstError(body, {
      name: ['required', 'string', 'min:1', 'max:100'],
      description: ['nullable', 'string'],
    });
    if (error) {
      errorJson(res, error, 422);
      return;
    }

    const category = await CategoryService.create(
      String(body.name),
      body.description ?? null,
    );
    res.status(201).json(ApiSerializer.category(category));
  }

  static async update(req, res) {
    const categoryId = parseInt(req.routeParam('category_id'), 10);
    const body = req.body || {};
    const category = await CategoryService.update(categoryId, body);
    res.json(ApiSerializer.category(category));
  }

  static async destroy(req, res) {
    const categoryId = parseInt(req.routeParam('category_id'), 10);
    await CategoryService.delete(categoryId);
    res.status(204).send();
  }
}

module.exports = { CategoryController };
