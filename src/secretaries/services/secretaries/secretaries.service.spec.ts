import { Test, TestingModule } from '@nestjs/testing';
import { SecretariesService } from './secretaries.service';

describe('SecretariesService', () => {
  let service: SecretariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretariesService],
    }).compile();

    service = module.get<SecretariesService>(SecretariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
