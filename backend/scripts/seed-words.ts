import { config } from 'dotenv';
import { AppDataSource } from '../src/data-source';
import { WordSeedService } from '../src/utils/word-seed.service';
import * as path from 'path';

// Load environment variables - prioritize .env.development for local development
const envPath =
  process.env.NODE_ENV === 'production'
    ? '.env'
    : path.join(__dirname, '..', '.env.development');

config({ path: envPath });

async function runSeeding(): Promise<void> {
  try {
    console.log('Checking environment variables...');
    
    // Check for force flag
    const forceReseed = process.argv.includes('--force');
    if (forceReseed) {
      console.log('Force reseed mode enabled - will clear existing words');
    }
    
    const requiredEnvVars = [
      'DB_HOST',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_NAME',
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );
    
    if (missingVars.length > 0) {
      console.error(
        'Missing required environment variables:',
        missingVars.join(', '),
      );
      console.error(
        'Please create a .env file with database configuration based on .env.example',
      );
      process.exit(1);
    }

    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Starting word seeding process...');
    
    // Use the static method to create the service
    const seedService = WordSeedService.createWithDataSource(AppDataSource);
    await seedService.seedWords(forceReseed);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeeding();
