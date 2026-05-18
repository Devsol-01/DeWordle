import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndexerCursorEntity } from '../entities/indexer-cursor.entity';

@Injectable()
export class CursorService {
  constructor(
    @InjectRepository(IndexerCursorEntity)
    private readonly cursorRepo: Repository<IndexerCursorEntity>,
  ) {}

  async getOrCreate(network: string, streamKey: string) {
    const existing = await this.cursorRepo.findOne({
      where: { network, streamKey },
    });

    if (existing) {
      return existing;
    }

    return this.cursorRepo.save(
      this.cursorRepo.create({
        network,
        streamKey,
        lastLedger: 0,
        lastTxHash: '',
      }),
    );
  }

  async checkpoint(
    network: string,
    streamKey: string,
    lastLedger: number,
    lastTxHash: string,
  ) {
    const cursor = await this.getOrCreate(network, streamKey);
    cursor.lastLedger = lastLedger;
    cursor.lastTxHash = lastTxHash;
    await this.cursorRepo.save(cursor);
  }
}
