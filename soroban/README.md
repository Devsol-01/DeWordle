# Soroban Workspace

Foundational Soroban workspace for DeWordle migration.

## Layout
- `contracts/`: Soroban contract crates
- `crates/`: shared reusable libraries
- `sdk/ts/`: TypeScript SDK foundation
- `scripts/`: deployment and invocation scripts
- `tests/integration/`: cross-contract integration tests
- `config/`: network and contract registry config

## Build
```bash
cd soroban
cargo check --workspace
```

## Developer Commands
```bash
cd soroban
./scripts/setup.sh
make fmt
make check
make test
make build-wasm
```

## Contract Registry
Contract IDs per network are managed in `config/contracts.<network>.json`.
