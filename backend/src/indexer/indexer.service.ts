import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestedEventDto } from './dto/ingested-event.dto';
import { EventProcessorService } from './processors/event-processor.service';

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private readonly eventProcessor: EventProcessorService,
    private readonly configService: ConfigService,
  ) {}

  async ingest(event: IngestedEventDto) {
    await this.eventProcessor.process(event);
  }

  async poll() {
    const rpcUrl = this.configService.get<string>('SOROBAN_RPC_URL');
    const network = this.configService.get<string>('SOROBAN_NETWORK') || 'testnet';
    const contractId = this.configService.get<string>('SOROBAN_CORE_GAME_CONTRACT_ID');

    this.logger.debug(
      `Indexer poll scaffold: network=${network} rpc=${rpcUrl ?? 'unset'} contract=${contractId ?? 'unset'}`,
    );

    // Foundation phase: polling is intentionally a scaffold.
    // Future contributor tasks will fetch Soroban events from cursors,
    // normalize payloads, and send them through ingest().
  }
}
