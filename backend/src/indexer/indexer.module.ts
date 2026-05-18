import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexerController } from './indexer.controller';
import { IndexerService } from './indexer.service';
import { EventProcessorService } from './processors/event-processor.service';
import { ProjectionService } from './projections/projection.service';
import { IndexerQueueService } from './queue/indexer-queue.service';
import { IngestedEventEntity } from './entities/ingested-event.entity';
import { SessionProjectionEntity } from './entities/session-projection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngestedEventEntity, SessionProjectionEntity]),
  ],
  controllers: [IndexerController],
  providers: [IndexerService, EventProcessorService, ProjectionService, IndexerQueueService],
  exports: [IndexerService, ProjectionService],
})
export class IndexerModule {}
