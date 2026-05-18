import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IndexerService } from '../indexer.service';
import { CursorService } from '../projections/cursor.service';

@Injectable()
export class IndexerWorkerService {
  private readonly logger = new Logger(IndexerWorkerService.name);

  constructor(
    private readonly indexerService: IndexerService,
    private readonly cursorService: CursorService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async tick() {
    const cursor = await this.cursorService.getOrCreate('testnet', 'core_game_events');
    this.logger.debug(
      `Indexer worker tick from ledger ${cursor.lastLedger} tx ${cursor.lastTxHash}`,
    );

    await this.indexerService.poll();
  }
}
