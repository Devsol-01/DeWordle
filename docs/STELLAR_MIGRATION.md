# Stellar Ecosystem Migration Plan

## Current State
DeWordle currently uses Cairo/Starknet contracts in `onchain/`. This means the current smart-contract layer is not yet native to Stellar Soroban.

## Migration Goals
- Move onchain game state primitives to Soroban contracts (Rust).
- Integrate Stellar-compatible wallet UX (Freighter-first).
- Keep backend/frontend API boundaries stable during migration.

## Proposed Phases
1. Contract parity: port core game contract logic from Cairo to Soroban Rust.
2. Wallet integration: implement Freighter signing flow and contract calls from frontend.
3. Testnet launch: deploy to Stellar testnet and publish contract IDs.
4. Observability: instrument end-to-end metrics for wallet connect, tx success, and game completion.
5. Mainnet readiness: audit, threat model, and gradual release.

## Ecosystem-Relevant Features
- Public game APIs for Stellar dev tooling examples.
- Open source SDK wrapper for DeWordle contract interactions.
- Contributor tasks around Soroban tests, auth entries, and transaction simulation.

## Source References
- Stellar Docs: https://developers.stellar.org/docs
- Freighter integration guide: https://developers.stellar.org/docs/build/guides/freighter
- Soroban invocation signing: https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations
