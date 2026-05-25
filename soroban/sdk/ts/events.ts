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
  | "streak_updated"
  | "core_game_paused";

export type RewardsEventTopic = "accrued" | "claimed" | "emission_set";
export type AchievementsEventTopic = "achievement_defined" | "achievement_unlocked";
export type AdminRegistryEventTopic = "contract_set" | "role_set";

interface RawEvent {
  contractId: string;
  topic: string;
  value: unknown;
  ledger?: number;
  txHash?: string;
}

export function normalizeTopic(rawTopic: string): string {
  return rawTopic.trim().toLowerCase();
}

export function parseEvent<T>(raw: RawEvent): DecodedEvent<T> {
  return {
    contractId: raw.contractId,
    topic: normalizeTopic(raw.topic),
    payload: raw.value as T,
    ledger: raw.ledger,
    txHash: raw.txHash,
  };
}

export function parseCoreGameEvent<T = unknown>(raw: RawEvent): DecodedEvent<T> {
  return parseEvent<T>(raw);
}

export function parseRewardsEvent<T = unknown>(raw: RawEvent): DecodedEvent<T> {
  return parseEvent<T>(raw);
}

export function parseAchievementsEvent<T = unknown>(raw: RawEvent): DecodedEvent<T> {
  return parseEvent<T>(raw);
}

export function parseAdminRegistryEvent<T = unknown>(raw: RawEvent): DecodedEvent<T> {
  return parseEvent<T>(raw);
}

export function isCoreGameEvent(topic: string): topic is CoreGameEventTopic {
  return [
    "day_published",
    "session_started",
    "guess_submitted",
    "session_finalized",
    "streak_updated",
    "core_game_paused",
  ].includes(normalizeTopic(topic));
}
