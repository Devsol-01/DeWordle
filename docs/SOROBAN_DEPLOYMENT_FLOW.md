# Soroban Deployment Flow (Foundation)

## Current State
Deployment scripts are scaffolds to standardize future contributor work.

## Intended Flow
1. Build all wasm artifacts in `soroban/`.
2. Deploy `admin_registry` then `core_game`, `rewards`, `achievements`.
3. Persist resulting IDs in `soroban/config/contracts.<network>.json`.
4. Publish registry artifact to frontend/backend runtime config.

## Next Enhancements
- automated contract hash verification
- per-environment deploy manifests
- rollback and migration script support
