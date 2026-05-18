import { AppDataSource } from '../src/data-source';
import { WordSeedService } from '../src/utils/word-seed.service';

async function runSeeding() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Starting word seeding process...');
    const seedService = new WordSeedService(AppDataSource);
    await seedService.seedWords();
    
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

runSeeding();
