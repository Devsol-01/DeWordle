# Soroban Migration Foundation Architecture

## Goal
Establish a production-quality baseline for DeWordle's Soroban migration that supports high parallel contributor throughput.

## Foundation Components
- Soroban Rust workspace (`soroban/`)
- Foundational `core_game` contract
- Placeholder modular contracts (`rewards`, `achievements`, `admin_registry`)
- Shared crates for auth/types/utils
- TypeScript Soroban SDK scaffold
- Frontend wallet provider + hooks
- Backend indexer/projection skeleton

## Contract Boundaries (Phase Foundation)
- `core_game`: day config, session lifecycle, guess records, streak updates
- `rewards`: module placeholder and ABI foothold
- `achievements`: module placeholder and ABI foothold
- `admin_registry`: governance/address registry placeholder

## Security Baselines Included
- Explicit admin auth for day publishing
- Session ownership auth for gameplay calls
- Replay primitive via `(player, nonce)` uniqueness
- State transition constraints (`InProgress -> Won/Lost -> Finalized`)

## Deliberately Deferred
- Tokenomics and reward math
- Tournament engine
- Advanced anti-cheat proofs
- Full event indexer polling implementation

## Parallel Work Streams Enabled
1. Contract feature development
2. SDK typed bindings generation
3. Frontend gameplay integration
4. Backend indexer ingestion implementation
5. Ops/deployment hardening
