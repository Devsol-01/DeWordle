# DeWordle Backend

NestJS backend for auth, game sessions, words, leaderboard, metrics, and Soroban indexer foundations.

## Run
```bash
npm install
npm run start:dev
```

## Foundation Modules
- Existing gameplay/auth services
- `IndexerModule` skeleton for Soroban event ingestion and projections

## Required Env
Use `.env.development` and include Soroban indexer settings from `.env.example`.

## QA
```bash
npm run lint
npm run typecheck
npm run test
```
