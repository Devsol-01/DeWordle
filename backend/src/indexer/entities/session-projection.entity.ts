import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('session_projections')
@Index(['network', 'sessionId'], { unique: true })
export class SessionProjectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  network: string;

  @Column()
  sessionId: string;

  @Column()
  player: string;

  @Column()
  dayId: number;

  @Column()
  status: string;

  @Column({ default: 0 })
  attemptsUsed: number;

  @Column({ default: false })
  finalized: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
