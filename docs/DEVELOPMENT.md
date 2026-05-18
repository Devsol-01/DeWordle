# Development Guide

## Recommended Workflow
1. Pick an issue with acceptance criteria.
2. Create focused branch.
3. Implement with tests.
4. Run local quality checks.
5. Open PR using template.

## Backend Notes
- API prefix: `/api/v1`
- Swagger: `/api`
- Uses TypeORM migrations and seed scripts.

## Frontend Notes
- Next.js app router
- Keep UI changes accompanied by screenshots in PRs.

## Onchain Notes
- Current stack: Cairo/Starknet
- Migration target: Soroban (see `STELLAR_MIGRATION.md`)
