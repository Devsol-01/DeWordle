# Local Infrastructure Stack

This document covers the Docker Compose–based local stack for DeWordle backend
development, including startup profiles, environment variable reference, and known
limitations.

---

## Overview

The compose file at `backend/docker-compose.yml` defines three services. A Docker
Compose **profile** controls which services start; services with no profile always
start.

| Service       | Profile      | Port   | Always starts |
|---------------|--------------|--------|---------------|
| `postgres`    | *(none)*     | 5432   | Yes           |
| `backend`     | `backend`    | 3000   | No            |
| `rpc-proxy`   | `rpc-proxy`  | 7545   | No            |

---

## Quick start

All commands run from the project root.

```bash
# Postgres only (most common for day-to-day backend development)
./scripts/infra-up.sh postgres

# Postgres + NestJS API container
./scripts/infra-up.sh backend

# Postgres + Soroban RPC caching proxy
./scripts/infra-up.sh proxy

# Full stack — all three services
./scripts/infra-up.sh full

# Stop everything
./scripts/infra-up.sh down
```

Or call Docker Compose directly:

```bash
# From the project root
docker compose -f backend/docker-compose.yml up -d                            # postgres only
docker compose -f backend/docker-compose.yml --profile backend up -d --build # + API
docker compose -f backend/docker-compose.yml --profile rpc-proxy up -d       # + proxy

# From backend/
docker compose up -d
docker compose --profile backend up -d --build
```

---

## Service reference

### `postgres`

Standard PostgreSQL 15 container. Data is persisted in the `postgres_data` named
volume — it survives `docker compose down` but is removed by `docker compose down -v`.

| Config        | Value               |
|---------------|---------------------|
| Image         | `postgres:15-alpine`|
| Host          | `localhost`         |
| Port          | `5432`              |
| Database      | `dewordledb`        |
| Username      | `dewordledb_owner`  |
| Password      | `password`          |

Connection string: `postgresql://dewordledb_owner:password@localhost:5432/dewordledb`

---

### `backend` (profile: `backend`)

NestJS API built from `backend/Dockerfile`. The image is a two-stage build:
the first stage compiles TypeScript; the second stage runs only the compiled
output with production dependencies.

```
GET http://localhost:3000/api/v1/health   # health check
GET http://localhost:3000/api             # Swagger UI
```

#### First-run setup

After starting the backend for the first time (or after resetting the
`postgres_data` volume), run migrations:

```bash
cd backend && npm run typeorm:migration:run
```

#### Rebuilding the image

The backend image is not automatically rebuilt when source files change. Rebuild
explicitly:

```bash
docker compose -f backend/docker-compose.yml --profile backend up --build
# or
./scripts/infra-up.sh backend   # always passes --build
```

---

### `rpc-proxy` (profile: `rpc-proxy`)

Lightweight Node.js HTTP proxy that caches read-only Soroban RPC calls. Useful
when running repeated indexer replays or integration tests that would otherwise
exhaust the testnet rate limit.

| Config              | Default                              |
|---------------------|--------------------------------------|
| Listen port         | `7545`                               |
| Upstream RPC        | `https://soroban-testnet.stellar.org`|
| Cache TTL           | `30 000 ms`                          |
| Health endpoint     | `GET http://localhost:7545/health`   |

To point the backend at the proxy, set:

```bash
# From the host — set in .env or shell before starting the backend
SOROBAN_RPC_URL=http://localhost:7545

# Inside the Docker network (e.g. when backend runs as a container too)
SOROBAN_RPC_URL=http://rpc-proxy:7545
```

See [docs/wave/RPC_PROXY_SERVICE.md](./wave/RPC_PROXY_SERVICE.md) for the full
proxy reference, including which methods are cached.

---

## Environment variables

The `backend` service resolves environment in this order (last wins):

1. Defaults hard-coded in `docker-compose.yml`
2. `backend/.env` (loaded if present, not required)
3. `backend/.env.development` (loaded if present, not required)
4. Variables exported in the shell before running compose

| Variable                       | Compose default                        | Notes |
|--------------------------------|----------------------------------------|-------|
| `DB_HOST`                      | `postgres`                             | Points to the compose Postgres service |
| `DB_PORT`                      | `5432`                                 | |
| `DB_USERNAME`                  | `dewordledb_owner`                     | |
| `DB_PASSWORD`                  | `password`                             | |
| `DB_NAME`                      | `dewordledb`                           | |
| `DB_SSL`                       | `false`                                | |
| `PORT`                         | `3000`                                 | |
| `NODE_ENV`                     | `development`                          | |
| `SOROBAN_RPC_URL`              | `https://soroban-testnet.stellar.org`  | Override to point at the local proxy |
| `SOROBAN_NETWORK`              | `testnet`                              | |
| `SOROBAN_CORE_GAME_CONTRACT_ID`| `placeholder`                          | See note below |
| `JWT_SECRET`                   | *(insecure local default)*             | **Must be overridden in any shared env** |

**`SOROBAN_CORE_GAME_CONTRACT_ID`**: The NestJS env validator requires this to be
non-empty. A value of `"placeholder"` satisfies validation; the indexer poller will
find no matching events and log a `missing_config` warning but the rest of the API
will work normally. Set it to your actual deployed contract ID when you have one.

**`JWT_SECRET`**: The default value is for local development only. It is printed in
the compose file as a reminder to set a real secret before connecting to any
shared database or deploying.

---

## Resetting the database

```bash
# Remove the Postgres data volume — all data will be lost
docker compose -f backend/docker-compose.yml down -v

# Start fresh and re-run migrations
./scripts/infra-up.sh postgres
cd backend && npm run typeorm:migration:run
```

---

## Connecting from a locally-run backend

Most backend development runs the NestJS process outside Docker (faster hot-reload)
while Postgres runs inside the container. Use `./scripts/infra-up.sh postgres` to
start only Postgres, then run the backend locally:

```bash
./scripts/infra-up.sh postgres

# In another terminal
cd backend
cp .env.example .env        # fill in JWT_SECRET at minimum
npm run start:dev
```

The `.env.example` defaults (`DB_HOST=localhost`, port 5432) match what the compose
Postgres container exposes on the host.

---

## Known limitations

| Limitation | Detail |
|------------|--------|
| **No source hot-reload in the `backend` container** | The image is built once. Changes to `backend/src/` require `--build`. Use the locally-run backend for fast iteration. |
| **Migrations are not automatic** | The backend container starts after Postgres is healthy, but migrations are not run automatically. Run `npm run typeorm:migration:run` manually after the first start or after a volume reset. |
| **RPC proxy cache is in-memory** | Restarting the `rpc-proxy` container clears the cache. This is expected behavior. |
| **No SSL on Postgres by default** | `DB_SSL=false` is set for local dev. Never use this configuration in production. |
| **Single Postgres instance** | The compose stack does not run a replica or standby. It is for local development only. |
| **`postgres_data` volume persists across down** | Running `docker compose down` does not remove data. Use `docker compose down -v` to reset. |
| **`SOROBAN_CORE_GAME_CONTRACT_ID` must be non-empty** | The env validator requires it. The default `"placeholder"` value allows the app to start; set the real contract ID when available. |

---

## Related docs

- [Development Guide](./DEVELOPMENT.md) — overall contributor workflow
- [Ephemeral Test Database](./wave/EPHEMERAL_TEST_DB.md) — short-lived DBs for CI/integration tests
- [RPC Proxy Service](./wave/RPC_PROXY_SERVICE.md) — full proxy reference and caching behavior
- [Audit Log Retention](./AUDIT_LOG_RETENTION.md) — what to keep and for how long
