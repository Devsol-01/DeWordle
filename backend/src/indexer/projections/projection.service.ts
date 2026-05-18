import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionProjectionEntity } from '../entities/session-projection.entity';
import { IngestedEventDto } from '../dto/ingested-event.dto';

@Injectable()
export class ProjectionService {
  constructor(
    @InjectRepository(SessionProjectionEntity)
    private readonly sessionsRepo: Repository<SessionProjectionEntity>,
  ) {}

  async apply(event: IngestedEventDto) {
    if (event.topic !== 'session_finalized') {
      return;
    }

    const sessionId = String(event.payload.sessionId ?? '');
    if (!sessionId) {
      return;
    }

    const existing = await this.sessionsRepo.findOne({
      where: { network: event.network, sessionId },
    });

    const projection = this.sessionsRepo.create({
      id: existing?.id,
      network: event.network,
      sessionId,
      player: String(event.payload.player ?? ''),
      dayId: Number(event.payload.dayId ?? 0),
      status: String(event.payload.status ?? 'Finalized'),
      attemptsUsed: Number(event.payload.attemptsUsed ?? 0),
      finalized: true,
    });

    await this.sessionsRepo.save(projection);
  }
}
