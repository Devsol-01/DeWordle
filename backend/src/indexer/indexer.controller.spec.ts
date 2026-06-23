import { IndexerController } from './indexer.controller';

describe('IndexerController', () => {
  let controller: IndexerController;
  let indexerService: { ingest: jest.Mock; getLagSnapshot: jest.Mock };

  beforeEach(() => {
    indexerService = {
      ingest: jest.fn(),
      getLagSnapshot: jest.fn(),
    };

    controller = new IndexerController(indexerService as never);
  });

  it('returns the lag snapshot schema and values', async () => {
    indexerService.getLagSnapshot.mockResolvedValue({
      network: 'testnet',
      streamKey: 'core_game_events',
      cursor: {
        lastLedger: 120,
        lastTxHash: 'tx-abc',
        lastEventIndex: 4,
        updatedAt: '2026-05-29T12:34:56.000Z',
      },
      lastProcessedTxHash: 'tx-abc',
      networkLatestLedger: 125,
      lagLedgers: 5,
      replaySkips: 2,
      ingestedTotal: 33,
      projectionErrors: 1,
      pollCycles: 8,
    });

    await expect(controller.getLag()).resolves.toEqual({
      network: 'testnet',
      streamKey: 'core_game_events',
      cursor: {
        lastLedger: 120,
        lastTxHash: 'tx-abc',
        lastEventIndex: 4,
        updatedAt: '2026-05-29T12:34:56.000Z',
      },
      lastProcessedTxHash: 'tx-abc',
      networkLatestLedger: 125,
      lagLedgers: 5,
      replaySkips: 2,
      ingestedTotal: 33,
      projectionErrors: 1,
      pollCycles: 8,
    });
  });
});
