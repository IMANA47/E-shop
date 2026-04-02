import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { TheOrder } from '../the_orders/entities/the_order.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate total
      const total = createOrderDto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Create Order
      let order = this.orderRepository.create({
        userId: createOrderDto.userId,
        total: total,
        status: createOrderDto.status || 'pending',
      });
      order = await queryRunner.manager.save(order);

      // Create TheOrder lines (LigneCommande)
      for (const item of createOrderDto.items) {
        const theOrder = queryRunner.manager.create(TheOrder, {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
        await queryRunner.manager.save(theOrder);

        // Update Stock
        const productToUpdate = await queryRunner.manager.findOne(Product, { where: { id: item.productId } });
        if (productToUpdate) {
            productToUpdate.stock -= item.quantity;
            await queryRunner.manager.save(productToUpdate);
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(order.id) as Promise<Order>;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['user', 'theOrders', 'theOrders.product'] });
  }

  async findAllForUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { userId },
      relations: ['theOrders', 'theOrders.product'] 
    });
  }

  async findOne(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'theOrders', 'theOrders.product'],
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order | null> {
    await this.orderRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
