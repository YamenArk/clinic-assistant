import { Test, TestingModule } from '@nestjs/testing';
import { GovernoratesController } from './governorates.controller';

describe('GovernoratesController', () => {
  let controller: GovernoratesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovernoratesController],
    }).compile();

    controller = module.get<GovernoratesController>(GovernoratesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
