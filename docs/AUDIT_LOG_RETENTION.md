# Audit Log Retention and Tamper-Detection Policy

This document defines retention expectations and integrity verification procedures for
the three categories of audit-sensitive artifacts in the DeWordle backend: the
database-backed event audit trail, CI security scan reports, and operational logs.

---

## Artifact Inventory

### 1. Ingested-Event Audit Trail (`ingested_events` table)

Every event that passes validation and enters the ingestion pipeline is persisted as an
`IngestedEventEntity` row. Each row carries an `auditHash` column — a SHA-256
fingerprint of the canonical event fields. This is the primary tamper-evident artifact.

**Fields covered by the hash (in serialization order):**

| Position | Field        | Type                     |
|----------|--------------|--------------------------|
| 0        | `network`    | string                   |
| 1        | `contractId` | string                   |
| 2        | `topic`      | string                   |
| 3        | `txHash`     | string                   |
| 4        | `ledger`     | number                   |
| 5        | `eventIndex` | number                   |
| 6        | `payload`    | JSON-serialized object   |

The hash is computed by `computeAuditEventHash` in
`backend/src/indexer/audit/event-hash.ts`. The serialization is a `JSON.stringify`
of a fixed-order array — the order is stable across Node.js versions because it does
not depend on object key enumeration.

**Retention:** Rows in `ingested_events` have no TTL by default. In production,
establish a retention window based on the longest replay-integrity window you need to
support. The recommended minimum is **90 days**. Rows older than the retention window
may be archived or deleted by an operator-triggered job; they must not be silently
compacted by the database.

**Null `auditHash`:** Rows ingested before this policy was enacted may have a `null`
`auditHash`. A `null` value means the row predates hash computation, not that the row
was tampered with. See the Backfill section below.

---

### 2. CI Security Scan Reports (GitHub Actions artifacts)

The `advisory-triage` workflow runs weekly and on manual dispatch. It produces three
report artifacts:

| Artifact name         | Source command                        | Retention |
|-----------------------|---------------------------------------|-----------|
| `npm-audit-frontend`  | `npm audit --json` (frontend package) | 30 days   |
| `npm-audit-backend`   | `npm audit --json` (backend package)  | 30 days   |
| `cargo-audit-report`  | `cargo audit --json` (soroban crate)  | 30 days   |

Artifacts are stored by GitHub Actions and expire automatically after 30 days. They
are not replicated elsewhere. If a scan run is needed for a compliance or incident
review, the workflow can be re-triggered manually via `workflow_dispatch` — but note
that re-running against current HEAD reflects the current dependency state, not the
state at the time of the original run.

**Review trigger:** Any artifact that reports a vulnerability at severity
`moderate` or above should be triaged within one business day of the run date. The
`advisory-triage.yml` workflow logs the result without blocking CI to avoid false-positive
build failures; human triage is the control.

---

### 3. Operational Logs (application-level)

The backend indexer emits structured JSON log lines to stdout. Key log events and their
retention relevance:

| Log `msg` key                  | Meaning                                           | Retention relevance |
|--------------------------------|---------------------------------------------------|---------------------|
| `indexer.ingest.ok`            | Event accepted and hash stored                    | Correlates with `auditHash` row; keep for same window |
| `indexer.ingest.error`         | Projection or persistence failure                 | Keep until incident resolved + 30 days             |
| `indexer.event.duplicate`      | Replay detected and suppressed                    | Keep for replay-integrity review window             |
| `indexer.rpc.malformed_event`  | Raw RPC event rejected before normalization       | Keep for 30 days (operational debugging)            |
| `indexer.poll.tick`            | Cursor position at each poll cycle                | Keep for 7 days (operational debugging)             |
| `indexer.replay.skip`          | Replay alert threshold crossed                    | Keep until alert is acknowledged + 7 days           |

Log retention is controlled by the hosting platform (e.g., Cloud Logging, Datadog,
Loki). The **minimum recommended retention** for each tier:

| Log tier        | Minimum retention |
|-----------------|-------------------|
| Error / warning | 90 days           |
| Info            | 30 days           |
| Debug           | 7 days            |

Logs are not integrity-hashed. They are informational and should be treated as
supplementary evidence alongside the `ingested_events` audit trail.

---

## Tamper-Detection: Event Audit Hash

### How to verify a stored row

Use `verifyAuditEventHash` from `backend/src/indexer/audit/event-hash.ts`:

```typescript
import { verifyAuditEventHash } from './audit/event-hash';

const row = await eventsRepo.findOne({ where: { id } });

const intact = verifyAuditEventHash(
  {
    network:     row.network,
    contractId:  row.contractId,
    topic:       row.topic,
    txHash:      row.txHash,
    ledger:      row.ledger,
    eventIndex:  row.eventIndex,
    payload:     row.payload,
  },
  row.auditHash,
);

if (!intact) {
  // Row has been modified after ingestion, or auditHash is null (pre-policy row).
}
```

`verifyAuditEventHash` returns `false` for a `null` or empty `storedHash` so that
pre-policy rows without a hash are flagged rather than silently passed.

### What a hash mismatch means

A mismatch between a recomputed hash and the stored `auditHash` means one of:

1. A field in the row was mutated directly in the database after ingestion.
2. The `auditHash` column itself was overwritten.
3. A bug in the application wrote incorrect field values before computing the hash.

In all cases the affected row should be treated as untrusted. Cross-reference the
original Soroban ledger using the stored `txHash` and `eventIndex` to determine the
ground-truth values. Do not delete or overwrite the row before the investigation is
complete.

### Known limitation: payload key-order sensitivity

The hash is computed from `JSON.stringify(payload)`. Key insertion order in the `payload`
object is preserved by V8, so two logically equivalent payloads with different key
orders will produce different hashes. The indexer normalizes events before saving them,
so this is not a risk in production; but any direct database repair that reconstructs
`payload` must reproduce the exact original key order to pass verification.

### Null auditHash backfill

To backfill hashes for rows ingested before this policy:

```sql
-- Identify rows without a hash
SELECT id, network, contract_id, topic, tx_hash, ledger, event_index, payload
FROM ingested_events
WHERE audit_hash IS NULL;
```

Recompute each hash in application code using `computeAuditEventHash` with the row's
stored fields, then write the result back. Do not run this as a raw SQL update — the
hash must be computed by the same algorithm used at ingestion time.

---

## CI Artifact Integrity

GitHub Actions artifacts are stored in GitHub's artifact storage and are not
integrity-signed at rest. The integrity guarantee comes from the reproducibility of the
workflow run: the same commit + dependency state produces the same report. To verify
that an artifact is authentic:

1. Note the `Run ID` from the Actions run that produced it.
2. Re-trigger the same workflow at the same commit SHA via `workflow_dispatch` or
   `git checkout <sha> && gh workflow run advisory-triage.yml`.
3. Compare the new report against the archived one.

If the dependency state has changed since the original run (e.g., a package was yanked),
the re-run will reflect the current state, which may differ legitimately.

---

## Review Cadence

| Artifact                       | Review cadence          | Owner          |
|--------------------------------|-------------------------|----------------|
| `auditHash` spot-check         | On incident or monthly  | Backend on-call |
| npm / cargo audit reports      | Weekly (automated run)  | Security triage |
| Error-level operational logs   | Continuous (alerting)   | On-call         |
| Replay skip spike              | Immediate (alert fires) | Backend on-call |

---

## Related Docs

- [Security Foundation](./SECURITY_FOUNDATION.md) — threat model and pre-testnet hardening checklist
- [Replay Safety Model](./REPLAY_SAFETY_MODEL.md) — end-to-end replay safety narrative
- [Backend Indexer Foundation](./BACKEND_INDEXER_FOUNDATION.md) — indexer architecture overview
- `backend/src/indexer/audit/event-hash.ts` — canonical hash implementation
- `backend/src/indexer/entities/ingested-event.entity.ts` — `auditHash` column definition
