import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheOrdersService } from './the_orders.service';
import { TheOrdersController } from './the_orders.controller';
import { TheOrder } from './entities/the_order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TheOrder])],
  controllers: [TheOrdersController],
  providers: [TheOrdersService],
})
export class TheOrdersModule {}
