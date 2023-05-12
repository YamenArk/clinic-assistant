import { Test, TestingModule } from '@nestjs/testing';
import { GovernoratesService } from './governorates.service';

describe('GovernoratesService', () => {
  let service: GovernoratesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GovernoratesService],
    }).compile();

    service = module.get<GovernoratesService>(GovernoratesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
