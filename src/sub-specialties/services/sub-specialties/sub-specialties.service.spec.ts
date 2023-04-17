import { Test, TestingModule } from '@nestjs/testing';
import { SubSpecialtiesService } from './sub-specialties.service';

describe('SubSpecialtiesService', () => {
  let service: SubSpecialtiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubSpecialtiesService],
    }).compile();

    service = module.get<SubSpecialtiesService>(SubSpecialtiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
