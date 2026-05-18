import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestedEventDto } from '../dto/ingested-event.dto';
import { IngestedEventEntity } from '../entities/ingested-event.entity';
import { ProjectionService } from '../projections/projection.service';

@Injectable()
export class EventProcessorService {
  private readonly logger = new Logger(EventProcessorService.name);

  constructor(
    @InjectRepository(IngestedEventEntity)
    private readonly eventsRepo: Repository<IngestedEventEntity>,
    private readonly projectionService: ProjectionService,
  ) {}

  async process(event: IngestedEventDto) {
    const exists = await this.eventsRepo.findOne({
      where: {
        network: event.network,
        txHash: event.txHash,
        eventIndex: event.eventIndex,
      },
    });

    if (exists) {
      this.logger.debug(
        `Skipping replayed event ${event.txHash}#${event.eventIndex}`,
      );
      return;
    }

    await this.eventsRepo.save(this.eventsRepo.create(event));
    await this.projectionService.apply(event);
  }
}
