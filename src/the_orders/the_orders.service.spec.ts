import { Test, TestingModule } from '@nestjs/testing';
import { TheOrdersService } from './the_orders.service';

describe('TheOrdersService', () => {
  let service: TheOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TheOrdersService],
    }).compile();

    service = module.get<TheOrdersService>(TheOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
