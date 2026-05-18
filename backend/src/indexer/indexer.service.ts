import { Injectable, Logger } from '@nestjs/common';
import { IngestedEventDto } from './dto/ingested-event.dto';
import { EventProcessorService } from './processors/event-processor.service';

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(private readonly eventProcessor: EventProcessorService) {}

  async ingest(event: IngestedEventDto) {
    await this.eventProcessor.process(event);
  }

  async poll() {
    this.logger.debug('Indexer poll scaffold: implement Soroban RPC cursor polling');
  }
}
