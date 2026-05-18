# Drips / Wave Preparation

## Maintainer Workflow
- Maintain issue triage twice weekly.
- Assign issue sizes (`S`, `M`, `L`) and difficulty labels.
- Require clear acceptance criteria before assignment.
- Enforce PR template and CI-required checks.

## Issue Sizing
- `S` (2-6 hrs): doc fixes, typed utility cleanup, test additions.
- `M` (1-3 days): module refactors, endpoint hardening, integration tests.
- `L` (4+ days): Soroban porting tasks, auth architecture changes.

## Wave-Friendly Task Design
Each issue should include:
- Scope boundaries (files/modules)
- Acceptance checklist
- Test expectations
- Reviewer hints

## Suggested Impact Metrics
- PRs merged per wave
- First-time contributors retained after 30 days
- Median issue cycle time
- Test coverage delta
- Soroban migration milestone completion

## Recurring Contribution Opportunities
- Contract parity tracking (Cairo -> Soroban)
- API hardening and validation coverage
- E2E test expansion
- DevEx and docs maintenance
