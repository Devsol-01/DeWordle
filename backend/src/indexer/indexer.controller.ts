import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IndexerService } from './indexer.service';
import { IngestedEventDto } from './dto/ingested-event.dto';
import { IndexerLagResponseDto } from './dto/indexer-lag-response.dto';

@ApiTags('Indexer')
@Controller('indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Get('lag')
  @ApiOperation({
    summary: 'Get indexer lag snapshot',
    description:
      'Returns the current stream cursor position, latest known network ledger, derived lag, and replay skip counters for operational dashboards.',
  })
  @ApiOkResponse({
    description: 'Indexer lag snapshot for operational monitoring dashboards.',
    type: IndexerLagResponseDto,
  })
  async getLag() {
    return this.indexerService.getLagSnapshot();
  }

  @Post('ingest')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async ingest(@Body() event: IngestedEventDto) {
    await this.indexerService.ingest({
      ...event,
      observedAt: event.observedAt ? new Date(event.observedAt) : new Date(),
    });

    return { status: 'accepted' };
  }
}
