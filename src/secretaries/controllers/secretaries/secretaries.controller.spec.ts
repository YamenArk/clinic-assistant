import { Test, TestingModule } from '@nestjs/testing';
import { SecretariesController } from './secretaries.controller';

describe('SecretariesController', () => {
  let controller: SecretariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretariesController],
    }).compile();

    controller = module.get<SecretariesController>(SecretariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
