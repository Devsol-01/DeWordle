# Contributing to DeWordle

Thanks for contributing to the Soroban migration.

## Workstream Model
Contributors are encouraged to work in parallel across:
- Soroban contracts (`soroban/contracts`)
- Shared crates (`soroban/crates`)
- SDK (`soroban/sdk/ts`)
- Frontend wallet integration (`frontend/src/lib/stellar`)
- Backend indexer (`backend/src/indexer`)
- Documentation and testing (`docs/`, `soroban/tests`)

## Setup
```bash
npm run install:all
npm run lint
npm run build
```

For Soroban:
```bash
cd soroban
cargo check --workspace
```

## PR Requirements
- Keep scope narrow and issue-linked.
- Add docs for new architecture or APIs.
- Include tests where behavior changes.
- Follow templates and checklist.

## Wave Readiness
Use `docs/WAVE_MIGRATION_ISSUE_CANDIDATES.md` and `docs/SOROBAN_GITHUB_STRATEGY.md` for issue slicing and labels.
