# First FastAPI (Orchestr)

This application replicates the **first-fastapi** project using the [Orchestr](https://www.npmjs.com/package/@orchestr-sh/orchestr) framework. Structure follows the [orchestr-sh-skeleton](https://github.com/orchestr-sh/skeleton).

**Quick start (after clone):** `npm install && npm run serve` — API at http://localhost:3000

## Endpoints (same as FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Hello message |
| GET | `/health` | Health check |
| GET | `/items` | List items (query: `skip`, `limit`) |
| GET | `/items/stats/summary` | Item statistics (total, avg/min/max price) |
| GET | `/items/:item_id` | Get one item |
| POST | `/items` | Create item (body: `name`, `description?`, `price`, `category?`) |
| PATCH | `/items/:item_id` | Partial update |
| DELETE | `/items/:item_id` | Delete item (**requires `X-API-Key` header**) |

## Run

**Local**
```bash
npm install
npm run serve
# or: npm run start
```

**Docker**
```bash
docker compose up --build
# API at http://localhost:3000
```

**Docker (dev profile, mount source)**
```bash
docker compose --profile dev up api-dev --build
```

- API: **http://localhost:3000**
- Default API key for DELETE: `dev-key-123` (set `API_KEY` to override)

## Environment (skeleton-style)

| Variable | Purpose |
|----------|---------|
| `APP_NAME` | App name |
| `APP_PORT` | HTTP port (default 3000) |
| `APP_HOST` | HTTP host (default localhost) |
| `APP_DEBUG` | Set to `true` for debug |
| `DB_CONNECTION` | Default `sqlite` |
| `DB_DATABASE` | SQLite path (default `database/database.sqlite`) |
| `API_KEY` | API key for DELETE (default `dev-key-123`) |

## Project layout (skeleton-aligned)

- **bootstrap/app.js** – Creates application, registers config + providers, sets Facade
- **bootstrap/cli.js** – CLI entry (e.g. `npm run orchestr migrate`)
- **public/index.js** – HTTP entry (serve/start)
- **config/index.js** – Aggregates config (app, database)
- **config/app.js**, **config/database.js** – App and DB settings
- **app/Providers/** – AppServiceProvider, RouteServiceProvider
- **app/Console/Kernel.js** – Console commands (migrate, seed, etc.)
- **app/Models/Item.js** – Item Ensemble model
- **app/Services/ItemService.js** – Stats logic
- **app/helpers/db.js** – Raw DB helper for PATCH/DELETE (adapter workaround)
- **app/appInstance.js** – App reference for helpers
- **routes/api.js** – API routes
- **middleware/verifyApiKey.js** – API key middleware for DELETE
- **database/migrations/** – Items table migration (JS)

## Scripts

| Script | Command |
|--------|---------|
| `npm run serve` | Start HTTP server |
| `npm run start` | Same as serve |
| `npm run orchestr` | Run Orchestr CLI (e.g. `npm run orchestr migrate`) |
| `npm run migrate` | Run migrations |
| `npm run test` | Run tests (watch) |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |

## Testing

Tests mirror **first-fastapi**’s `tests/test_main.py` and run against a separate SQLite DB (`database/test.sqlite`).

- **Setup:** `tests/setup.js` sets `DB_DATABASE` to the test DB before the app loads.
- **Helper:** `tests/helpers/app.js` boots the app, ensures the items table, and starts an HTTP server on a random port; `clearItems(app)` clears the items table between tests.
- **API tests:** `tests/api.test.js` – 20 tests for `/`, `/health`, `/items` (list, create, get, update, delete, stats) and API key behaviour.

```bash
npm run test:run
npm run test:coverage
```

## Docker

- **Dockerfile** – Node 22 Alpine, installs deps with `npm ci --omit=dev`, runs `node public/index.js`. Exposes 3000, `APP_HOST=0.0.0.0` for port mapping.
- **docker-compose.yml** – `api` service: build, port 3000, volume for SQLite data. `api-dev` (profile `dev`): mount source, same port.
- **.dockerignore** – Excludes node_modules, .git, coverage, *.sqlite, .env, docs, CI.

## CI

- **.github/workflows/ci.yml** – On push/PR to `main`:
  - **test** – Node 22, `npm ci`, `npm run test:run`.
  - **docker** – Build image with Buildx (no push), verify Dockerfile.

## Deploying to GitHub

1. **Create a new repository** on GitHub (no need to add a README if you already have one locally).

2. **Push your code** (CI runs on the `main` branch):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/orchestr-app.git
   git branch -M main
   git push -u origin main
   ```
   If your default branch is `master`, either rename it to `main` as above or change `branches: [main]` in `.github/workflows/ci.yml` to `[master]`.

3. **What runs on GitHub**
   - Every **push** and **pull request** to `main` triggers the CI workflow: tests and Docker build must pass.
   - View runs under the repo **Actions** tab.

4. **Secrets**
   - Do not commit `.env` or real API keys; they are in `.gitignore`.
   - For production, set `API_KEY` and `DB_*` (or equivalent) in your deployment environment or GitHub Actions secrets if you add a deploy step.

## Notes

- The items table is created automatically on first HTTP start (`public/index.js`). You can also run migrations via `npm run migrate` (uses same config).
- PATCH and DELETE use a raw DB helper because the current Orchestr DrizzleAdapter uses `.all()` for all `query()` calls; SQLite requires `.run()` for UPDATE/DELETE.
