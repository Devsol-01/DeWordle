export interface IngestedEventDto {
  network: 'testnet' | 'mainnet';
  contractId: string;
  topic: string;
  txHash: string;
  ledger: number;
  eventIndex: number;
  payload: Record<string, unknown>;
  observedAt: Date;
}
