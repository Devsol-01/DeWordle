import { Test, TestingModule } from '@nestjs/testing';
import { WordValidationProvider } from './word-validation-provider';

describe('WordValidationProvider', () => {
  let provider: WordValidationProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordValidationProvider],
    }).compile();

    provider = module.get<WordValidationProvider>(WordValidationProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
