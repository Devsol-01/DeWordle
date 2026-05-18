import { Body, Controller, Post } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { IngestedEventDto } from './dto/ingested-event.dto';

@Controller('indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Post('ingest')
  async ingest(@Body() event: IngestedEventDto) {
    await this.indexerService.ingest({
      ...event,
      observedAt: event.observedAt ? new Date(event.observedAt) : new Date(),
    });

    return { status: 'accepted' };
  }
}
