# Soroban Local Development

## Prerequisites
- Rust stable
- `wasm32-unknown-unknown` target
- Soroban CLI

## Build Workspace
```bash
cd soroban
cargo check --workspace
```

## Build Wasm Artifacts
```bash
cd soroban
cargo build --workspace --target wasm32-unknown-unknown --release
```

## Scripts
- Deploy scaffold: `soroban/scripts/deploy/deploy-testnet.sh`
- Invoke scaffold: `soroban/scripts/invoke/invoke-core-game.sh`

## Network Registry
Update contract IDs in:
- `soroban/config/contracts.testnet.json`
- `soroban/config/contracts.mainnet.json`
