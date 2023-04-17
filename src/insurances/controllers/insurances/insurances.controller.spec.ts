import { Test, TestingModule } from '@nestjs/testing';
import { InsurancesController } from './insurances.controller';

describe('InsurancesController', () => {
  let controller: InsurancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsurancesController],
    }).compile();

    controller = module.get<InsurancesController>(InsurancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
