# Backend Indexer Foundation

## Purpose
Shift backend responsibilities toward read models, analytics, and event projection from Soroban events.

## Added Foundation
- `IndexerModule`
- replay-safe `IngestedEventEntity` with unique `(network, txHash, eventIndex)`
- `SessionProjectionEntity` for read API projections
- `EventProcessorService` for idempotent processing
- `ProjectionService` for projection updates
- `IndexerController` ingestion endpoint scaffold

## Next Steps
- Replace manual ingest endpoint with Soroban RPC poller worker
- Add durable cursor/checkpoint table
- Expand projections for leaderboard/day stats
