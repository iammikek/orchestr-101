const { Item } = require('../Models/Item');
const { ItemService } = require('../Services/ItemService');
const { runUpdate, runDelete } = require('../helpers/db');

/**
 * Item controller – Laravel-style resource controller.
 * ItemService is used for business logic (e.g. stats).
 */
function itemToDict(row) {
  return {
    id: row.getAttribute('id'),
    name: row.getAttribute('name'),
    description: row.getAttribute('description'),
    price: row.getAttribute('price'),
    category: row.getAttribute('category'),
  };
}

class ItemController {
  static index(req, res) {
    return (async () => {
      const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const rows = await Item.query().offset(skip).limit(limit).get();
      res.json(rows.map((r) => itemToDict(r)));
    })();
  }

  static show(req, res) {
    return (async () => {
      const id = parseInt(req.routeParam('item_id'), 10);
      if (Number.isNaN(id)) {
        res.status(404).json({ detail: 'Item not found' });
        return;
      }
      const row = await Item.find(id);
      if (!row) {
        res.status(404).json({ detail: 'Item not found' });
        return;
      }
      res.json(itemToDict(row));
    })();
  }

  static store(req, res) {
    return (async () => {
      await req.parseBody();
      const body = req.body || {};
      const name = body.name;
      const price = body.price;
      if (name == null || price == null) {
        res.status(422).json({ detail: 'name and price are required' });
        return;
      }
      const row = await Item.create({
        name: String(name),
        description: body.description != null ? String(body.description) : null,
        price: Number(price),
        category: body.category != null ? String(body.category) : null,
      });
      res.status(201).json(itemToDict(row));
    })();
  }

  static update(req, res) {
    return (async () => {
      await req.parseBody();
      const id = parseInt(req.routeParam('item_id'), 10);
      if (Number.isNaN(id)) {
        res.status(404).json({ detail: 'Item not found' });
        return;
      }
      const row = await Item.find(id);
      if (!row) {
        res.status(404).json({ detail: 'Item not found' });
        return;
      }
      const body = req.body || {};
      const updates = {};
      if (body.name !== undefined) updates.name = String(body.name);
      if (body.description !== undefined) updates.description = body.description != null ? String(body.description) : null;
      if (body.price !== undefined) updates.price = Number(body.price);
      if (body.category !== undefined) updates.category = body.category != null ? String(body.category) : null;
      if (Object.keys(updates).length > 0) {
        const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
        const bindings = [...Object.values(updates), id];
        await runUpdate(`UPDATE items SET ${setClause} WHERE id = ?`, bindings);
      }
      const updated = await Item.find(id);
      res.json(itemToDict(updated));
    })();
  }

  static destroy(req, res) {
    return (async () => {
      const id = parseInt(req.routeParam('item_id'), 10);
      if (Number.isNaN(id)) {
        res.status(404).json({ detail: 'Item not found' });
        return;
      }
      const row = await Item.find(id);
      if (!row) {
        res.status(404).json({ detail: 'Item not found' });
        return;
      }
      await runDelete('DELETE FROM items WHERE id = ?', [id]);
      res.status(204).send();
    })();
  }

  /** Stats summary – uses ItemService for business logic */
  static statsSummary(req, res) {
    return (async () => {
      const stats = await ItemService.getStats();
      res.json(stats);
    })();
  }
}

module.exports = { ItemController };
