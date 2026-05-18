import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { TestEntity } from './entities/test.entity';
import { Word } from './entities/word.entity';
import { GameSession } from './game-sessions/entities/game-session.entity';
import { User } from './auth/entities/user.entity';
import { Game } from './games/entities/game.entity';
import { GuessHistory } from './game-sessions/entities/guess-history.entity';
import * as path from 'path';

const envPath = process.env.ENV_FILE_PATH
  ? path.resolve(process.cwd(), process.env.ENV_FILE_PATH)
  : process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env')
    : path.resolve(process.cwd(), '.env.development');

config({ path: envPath });

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: Number.parseInt(configService.get('DB_PORT') ?? '5432', 10),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  ssl:
    configService.get('DB_SSL') === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  entities: [TestEntity, Word, Game, User, GameSession, GuessHistory],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});
