# Getting Fast at Orchestr

A step-by-step guide to building a minimal Orchestr app with Docker, SQLite, and tests. This project replicates [**fastAPI-101**](https://github.com/iammikek/fastAPI-101) in [Orchestr](https://www.npmjs.com/package/@orchestr-sh/orchestr) (Laravel-style Node.js). It demonstrates routing, path/query parameters, request bodies, database integration, and testing.

---

## What's Included

1. **A minimal Orchestr application** – `bootstrap/app.js`, `public/index.js`, and `routes/api.js` with root, health, and items API
2. **Dependency list** (`package.json`) for Node packages
3. **A Docker image** (`Dockerfile`) that runs the app in a container
4. **Docker Compose** (`docker-compose.yml`) for one-command run
5. **A `.dockerignore`** so unnecessary files stay out of the image
6. **A persistent database** (SQLite + Drizzle/Ensemble) for items
7. **A test framework** (Vitest + HTTP server) for API tests
8. **A CI pipeline** (GitHub Actions) for automated testing and Docker build
9. **API key authentication** (middleware) for protecting endpoints
10. **Service layer** (`app/Services/ItemService.js`) separating business logic from routes
11. **Database schema** – migrations and table creation on startup

By the end, you can start the API with a single command.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Dependencies: package.json](#2-dependencies-packagejson)
3. [The Orchestr App](#3-the-orchestr-app)
4. [The Dockerfile](#4-the-dockerfile)
5. [Docker Compose](#5-docker-compose)
6. [.dockerignore](#6-dockerignore)
7. [How to Run Everything](#7-how-to-run-everything)
8. [Routes and the items API](#8-routes-and-the-items-api)
9. [Add a persistent database](#9-add-a-persistent-database)
10. [Add a test framework](#10-add-a-test-framework)
11. [Add a CI pipeline](#11-add-a-ci-pipeline)
12. [Add API key authentication](#12-add-api-key-authentication)
13. [Add a service layer](#13-add-a-service-layer)
14. [Quick Reference](#14-quick-reference)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm run serve
# or: docker compose up --build

# Run tests
npm run test:run
```

Then open **http://localhost:3000** for the API.

**Note:** The app works with defaults (`API_KEY=dev-key-123`, `DB_DATABASE=database/database.sqlite`). Set env vars to override.

---

## 1. Project Structure

```
orchestr-app/
├── bootstrap/
│   ├── app.js              # Creates app, registers providers (like Laravel bootstrap/app.php)
│   └── cli.js              # CLI entry (migrate, seed, etc.)
├── public/
│   └── index.js            # HTTP entry – boots app, ensures table, starts server
├── config/
│   ├── index.js            # Aggregates config for ConfigServiceProvider
│   ├── app.js              # APP_NAME, APP_PORT, APP_HOST, APP_DEBUG
│   └── database.js        # DB_CONNECTION, DB_DATABASE (SQLite path)
├── app/
│   ├── Providers/         # AppServiceProvider, RouteServiceProvider
│   ├── Console/Kernel.js   # Console commands (migrate, seed, …)
│   ├── Models/Item.js      # Ensemble model (like Laravel Eloquent model)
│   ├── Services/ItemService.js  # Business logic (stats)
│   ├── helpers/db.js      # Raw DB helper for UPDATE/DELETE workaround
│   └── appInstance.js     # App reference for helpers
├── routes/
│   └── api.js             # All HTTP routes (like Laravel routes/api.php)
├── middleware/
│   └── verifyApiKey.js    # API key auth for DELETE
├── database/
│   └── migrations/        # Items table migration (JS)
├── tests/
│   ├── setup.js           # Set DB_DATABASE to test DB (like conftest.py)
│   ├── helpers/app.js     # createTestServer, clearItems
│   └── api.test.js        # API tests (like test_main.py)
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .github/workflows/ci.yml
└── README.md
```

---

## 2. Dependencies: package.json

**What it is:** Node’s manifest. `npm install` (or `npm ci`) installs everything the app needs.

**What we use:**

| Package | Purpose |
|--------|---------|
| `@orchestr-sh/orchestr` | Web/ORM framework: routing, Ensemble (ORM), config, providers |
| `drizzle-orm` | DB layer used by Orchestr’s adapter |
| `reflect-metadata` | Used by Orchestr |
| `vitest` (dev) | Test runner and assertions |
| `@vitest/coverage-v8` (dev) | Coverage report |

**Orchestr equivalent of Laravel:** one framework handles app, HTTP, and DB (like Laravel + Eloquent).

**Copy-paste: `package.json` (scripts + deps)**

```json
{
  "scripts": {
    "serve": "node public/index.js",
    "start": "node public/index.js",
    "orchestr": "node bootstrap/cli.js",
    "migrate": "node bootstrap/cli.js migrate",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@orchestr-sh/orchestr": "^1.9.4",
    "drizzle-orm": "^0.45.1",
    "reflect-metadata": "^0.2.2"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^2.1.0",
    "vitest": "^2.1.0"
  }
}
```

---

## 3. The Orchestr App

**What it is:** The app is created in `bootstrap/app.js` (like Laravel’s `bootstrap/app.php` and service providers). The HTTP server is started in `public/index.js` (like running `php artisan serve`).

**Concepts:**

- **`createApp()`** – Creates `Application`, sets Facade, registers Config, Database, App and Route providers. No single “app” object in one file; the app is assembled in bootstrap.
- **`Route.get("/", handler)`** – Registers a GET route. Handlers receive `(req, res)`; use `res.json({ ... })` to return JSON.
- **Route registration** – Routes are loaded in `RouteServiceProvider.boot()` by requiring `routes/api.js`, which calls `registerRoutes()` and registers routes with `Route.get/post/patch/delete`.

**Endpoints we define:**

| Path | Method | Purpose |
|------|--------|--------|
| `/` | GET | Hello message |
| `/health` | GET | Health check |
| `/items` | GET | List items (query: `skip`, `limit`) |
| `/items/:item_id` | GET | Get one item |
| `/items` | POST | Create item (body: name, description?, price, category?) |
| `/items/:item_id` | PATCH | Partial update |
| `/items/:item_id` | DELETE | Delete (requires `X-API-Key`) |
| `/items/stats/summary` | GET | Item statistics |

**Orchestr equivalent of Laravel `routes/api.php`:**

In **routes/api.js** you register routes (like Laravel’s route files):

```javascript
const { Route } = require('@orchestr-sh/orchestr');

function registerRoutes() {
  Route.get('/', (req, res) => {
    res.json({ message: 'Hello from Orchestr!' });
  });

  Route.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // ... more routes
}
module.exports = { registerRoutes };
```

The **HTTP entry** (`public/index.js`) boots the app and starts the server:

```javascript
const { Kernel } = require('@orchestr-sh/orchestr');
const { createApp } = require('../bootstrap/app');

async function main() {
  const app = createApp();
  await app.boot();
  await ensureItemsTable(app);
  const kernel = new Kernel(app);
  const port = app.make('config').get('app.port', 3000);
  const host = app.make('config').get('app.host', 'localhost');
  kernel.listen(port, host, () => {
    console.log(`[Orchestr] Server running at http://${host}:${port}`);
  });
}
main().catch((e) => { console.error(e); process.exit(1); });
```

---

## 4. The Dockerfile

**What it is:** Instructions for building a Docker image (Node app instead of Python).

| Instruction | Meaning |
|-------------|---------|
| `FROM node:22-alpine` | Base image (Node 22, Alpine for size). |
| `RUN apk add --no-cache python3 make g++` | Build tools for native modules (e.g. better-sqlite3). |
| `WORKDIR /app` | Working directory in the container. |
| `COPY package.json package-lock.json .` | Copy dependency files first (layer caching). |
| `RUN npm ci --omit=dev` | Install production dependencies only. |
| `COPY bootstrap config app public routes middleware database .` | Copy application code. |
| `EXPOSE 3000` | App listens on 3000. |
| `CMD ["node", "public/index.js"]` | Start the app. `APP_HOST=0.0.0.0` in env so port mapping works. |

**Why copy package files before code?** So that when only source code changes, Docker reuses the `npm ci` layer and rebuilds faster.

---

## 5. Docker Compose

**What it is:** Define and run the app (and optionally other services) with one command.

| Key | Meaning |
|-----|---------|
| `build: .` | Build from the Dockerfile in the current directory. |
| `ports: "3000:3000"` | Host 3000 → container 3000 (http://localhost:3000). |
| `environment` | Set `APP_PORT`, `APP_HOST`, `DB_DATABASE`, `API_KEY`. |
| `volumes: app-data:/app/database` | Persist SQLite data. |

**Dev profile:** `docker compose --profile dev up api-dev` mounts the current directory and runs `node public/index.js` (no hot reload unless you add nodemon).

---

## 6. .dockerignore

**What it is:** Like `.gitignore` for Docker builds. Listed files/dirs are not sent to the build context.

**What we exclude:** `.git`, `.idea`, `node_modules`, `coverage`, `*.sqlite`, `database/*.sqlite`, `.env`, `*.md`, `Dockerfile`, `docker-compose*.yml`, `.github`.

---

## 7. How to Run Everything

**Local (no Docker):**

```bash
npm install
npm run serve
# or: npm run start
```

**Docker Compose:**

```bash
docker compose up --build
# API at http://localhost:3000
```

**Run tests:**

```bash
npm run test:run
npm run test:coverage
```

**CLI (migrate, etc.):**

```bash
npm run orchestr migrate
# or: npm run migrate
```

---

## 8. Routes and the items API

**Concepts (Orchestr vs Laravel):**

| Laravel | Orchestr |
|---------|----------|
| `Route::get('/items', ...)` + `$request->query('skip')`, `$request->query('limit')` | `Route.get('/items', async (req, res) => { ... })` – read `req.query.skip`, `req.query.limit` |
| `Route::get('/items/{item_id}', ...)` with `$item_id` | `Route.get('/items/:item_id', ...)` – read `req.routeParam('item_id')` |
| `Route::post('/items', ...)` + `return response()->json(..., 201)` | `Route.post('/items', ...)` then `res.status(201).json(...)` |
| Form Request (e.g. `StoreItemRequest`) | Validate in handler: check `req.body.name`, `req.body.price`, etc.; return 422 if missing |
| Eloquent model + default DB connection | Ensemble model; `Item` uses the connection set in `AppServiceProvider.boot()` |

**List items with query parameters:**

```javascript
Route.get('/items', async (req, res) => {
  const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const rows = await Item.query().offset(skip).limit(limit).get();
  res.json(rows.map((r) => itemToDict(r)));
});
```

**Get one item by path parameter:**

```javascript
Route.get('/items/:item_id', async (req, res) => {
  const id = parseInt(req.routeParam('item_id'), 10);
  const row = await Item.find(id);
  if (!row) {
    res.status(404).json({ detail: 'Item not found' });
    return;
  }
  res.json(itemToDict(row));
});
```

**Create item (POST + body):**

```javascript
Route.post('/items', async (req, res) => {
  await req.parseBody();
  const body = req.body || {};
  if (body.name == null || body.price == null) {
    res.status(422).json({ detail: 'name and price are required' });
    return;
  }
  const row = await Item.create({
    name: String(body.name),
    description: body.description != null ? String(body.description) : null,
    price: Number(body.price),
    category: body.category != null ? String(body.category) : null,
  });
  res.status(201).json(itemToDict(row));
});
```

---

## 9. Add a persistent database

**What you use:**

| Piece | Purpose |
|-------|---------|
| **SQLite** | Single-file database (e.g. `database/database.sqlite`). |
| **Orchestr + Drizzle** | Config in `config/database.js`; Orchestr’s DatabaseServiceProvider uses it. |
| **Ensemble** | ORM: `app/Models/Item.js` extends `Ensemble`, table `items`, fillable attributes. |
| **Table creation** | On first start, `public/index.js` runs `ensureItemsTable(app)` (raw SQL) so the table exists. Optionally run `npm run migrate` for migration-based setup. |

**Config (`config/database.js`):**

```javascript
const path = require('path');
module.exports = {
  default: process.env.DB_CONNECTION || 'sqlite',
  connections: {
    sqlite: {
      adapter: 'drizzle',
      driver: 'better-sqlite3',
      database: process.env.DB_DATABASE || path.join(process.cwd(), 'database', 'database.sqlite'),
    },
  },
};
```

**Model (`app/Models/Item.js`):**

```javascript
const { Ensemble } = require('@orchestr-sh/orchestr');

class Item extends Ensemble {
  constructor(attributes, fromDatabase) {
    super(attributes, fromDatabase);
    this.table = 'items';
    this.fillable = ['name', 'description', 'price', 'category'];
    this.timestamps = false;
    if (attributes && typeof attributes === 'object' && !fromDatabase) {
      this.fill(attributes);
    }
  }
}
module.exports = { Item };
```

**Wiring:** In `bootstrap/app.js`, `AppServiceProvider` is registered; in its `boot()` we call `Ensemble.setConnectionResolver(app.make('db'))` so all Ensemble models use the app’s DB connection.

---

## 10. Add a test framework

**What you use:**

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner and assertions (like pytest). |
| **tests/setup.js** | Runs before tests; sets `process.env.DB_DATABASE` to `database/test.sqlite` so tests don’t touch the main DB. |
| **tests/helpers/app.js** | `createTestServer()` – boots app, ensures items table, starts HTTP server on a random port; `clearItems(app)` – deletes all rows between tests. |
| **tests/api.test.js** | API tests: request helpers and 20 tests mirroring [fastAPI-101](https://github.com/iammikek/fastAPI-101)’s `test_main.py`. |

**Run tests:**

```bash
npm run test:run
npm run test:coverage
```

Tests use the same app as production but with a separate SQLite file; each test runs against a clean table after `clearItems(client.app)`.

---

## 11. Add a CI pipeline

**What you use:**

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | Runs on every push and PR to `main`. |
| **.github/workflows/ci.yml** | Defines two jobs: **test** (Node 22, `npm ci`, `npm run test:run`) and **docker** (build image to verify Dockerfile). |

No separate linter step in this repo; you can add ESLint later. The pipeline ensures tests and Docker build pass.

---

## 12. Add API key authentication

**What you use:** A middleware that checks the `X-API-Key` header and returns 401 if missing or wrong.

**Middleware (`middleware/verifyApiKey.js`):**

```javascript
const API_KEY = process.env.API_KEY || 'dev-key-123';

function verifyApiKey(req, res, next) {
  const key = req.header('x-api-key') || req.header('X-API-Key');
  if (!key || key !== API_KEY) {
    res.status(401).json({ detail: 'Invalid or missing API key' });
    return;
  }
  next();
}
module.exports = { verifyApiKey };
```

**Protect a route:** When registering the DELETE route, add the middleware to that route:

```javascript
const deleteItemRoute = Route.delete('/items/:item_id', async (req, res) => { ... });
deleteItemRoute.addMiddleware(verifyApiKey);
```

---

## 13. Add a service layer

**What you use:** A service class that holds business logic (e.g. stats). Routes stay thin and call the service.

**Service (`app/Services/ItemService.js`):**

```javascript
const { getRawDb } = require('../helpers/db');

class ItemService {
  static async getStats() {
    const raw = await getRawDb();
    if (!raw) return { total_items: 0, average_price: 0.0, min_price: null, max_price: null };
    const row = raw.prepare(
      'SELECT COUNT(*) as total, AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price FROM items'
    ).get();
    // ... build and return stats object
  }
}
```

**Route:** In `routes/api.js`, `GET /items/stats/summary` calls `ItemService.getStats()` and returns the result as JSON.

---

## 14. Quick Reference

| Goal | Command |
|------|---------|
| Start app (local) | `npm run serve` or `npm run start` |
| Start app (Docker) | `docker compose up --build` |
| Run tests | `npm run test:run` |
| Tests with coverage | `npm run test:coverage` |
| Migrations | `npm run migrate` or `npm run orchestr migrate` |
| API base URL | http://localhost:3000 |
| DELETE auth | Header `X-API-Key: dev-key-123` (or set `API_KEY`) |

---

## Deploying to GitHub

1. Create a new repository on GitHub.
2. Push your code (CI runs on `main`):
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/orchestr-101.git
   git branch -M main
   git push -u origin main
   ```
3. View workflow runs under the repo **Actions** tab.
4. Don’t commit `.env` or real API keys; use env vars or GitHub secrets for production.

---

## Notes

- The items table is created automatically on first HTTP start (`ensureItemsTable` in `public/index.js`). You can also run migrations via `npm run migrate`.
- PATCH and DELETE use a raw DB helper (`app/helpers/db.js`) because the current Orchestr DrizzleAdapter uses `.all()` for all `query()` calls; SQLite requires `.run()` for UPDATE/DELETE.
