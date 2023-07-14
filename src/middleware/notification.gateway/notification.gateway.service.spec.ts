import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGatewayService } from './notification.gateway.service';

describe('NotificationGatewayService', () => {
  let service: NotificationGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGatewayService],
    }).compile();

    service = module.get<NotificationGatewayService>(NotificationGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
