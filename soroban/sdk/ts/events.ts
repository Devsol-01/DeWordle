export interface DecodedEvent<T = unknown> {
  contractId: string;
  topic: string;
  payload: T;
  ledger?: number;
  txHash?: string;
}

export type CoreGameEventTopic =
  | "day_published"
  | "session_started"
  | "guess_submitted"
  | "session_finalized"
  | "streak_updated";

export function parseCoreGameEvent(raw: {
  contractId: string;
  topic: string;
  value: unknown;
  ledger?: number;
  txHash?: string;
}): DecodedEvent {
  return {
    contractId: raw.contractId,
    topic: raw.topic,
    payload: raw.value,
    ledger: raw.ledger,
    txHash: raw.txHash,
  };
}

export function isCoreGameEvent(topic: string): topic is CoreGameEventTopic {
  return [
    "day_published",
    "session_started",
    "guess_submitted",
    "session_finalized",
    "streak_updated",
  ].includes(topic);
}
