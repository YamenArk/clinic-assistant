import { Test, TestingModule } from '@nestjs/testing';
import { SubSpecialtiesController } from './sub-specialties.controller';

describe('SubSpecialtiesController', () => {
  let controller: SubSpecialtiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubSpecialtiesController],
    }).compile();

    controller = module.get<SubSpecialtiesController>(SubSpecialtiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
