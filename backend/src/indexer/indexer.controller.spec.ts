import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { IndexerController } from './indexer.controller';
import { IndexerService } from './indexer.service';

describe('IndexerController (Integration Tests)', () => {
  let app: INestApplication;
  let indexerService: { ingest: jest.Mock; getLagSnapshot: jest.Mock };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [IndexerController],
      providers: [
        {
          provide: IndexerService,
          useValue: {
            ingest: jest.fn(),
            getLagSnapshot: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    indexerService = moduleFixture.get(IndexerService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/indexer/lag (GET) returns the lag snapshot schema and values', async () => {
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

    await request(app.getHttpServer())
      .get('/indexer/lag')
      .expect(200)
      .expect({
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
