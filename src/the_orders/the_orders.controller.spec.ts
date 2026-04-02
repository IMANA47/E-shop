import { Test, TestingModule } from '@nestjs/testing';
import { TheOrdersController } from './the_orders.controller';
import { TheOrdersService } from './the_orders.service';

describe('TheOrdersController', () => {
  let controller: TheOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TheOrdersController],
      providers: [TheOrdersService],
    }).compile();

    controller = module.get<TheOrdersController>(TheOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
