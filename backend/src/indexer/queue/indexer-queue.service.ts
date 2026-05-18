import { Injectable, Logger } from '@nestjs/common';
import { IngestedEventDto } from '../dto/ingested-event.dto';

@Injectable()
export class IndexerQueueService {
  private readonly logger = new Logger(IndexerQueueService.name);

  async enqueue(event: IngestedEventDto) {
    this.logger.debug(
      `Queued event ${event.topic} at ${event.txHash}#${event.eventIndex}`,
    );
  }
}
