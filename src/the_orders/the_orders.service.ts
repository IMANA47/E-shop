import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTheOrderDto } from './dto/create-the_order.dto';
import { UpdateTheOrderDto } from './dto/update-the_order.dto';
import { TheOrder } from './entities/the_order.entity';

@Injectable()
export class TheOrdersService {
  constructor(
    @InjectRepository(TheOrder)
    private readonly theOrderRepository: Repository<TheOrder>,
  ) {}

  async create(createTheOrderDto: CreateTheOrderDto): Promise<TheOrder> {
    const theOrder = this.theOrderRepository.create(createTheOrderDto);
    return this.theOrderRepository.save(theOrder);
  }

  async findAll(): Promise<TheOrder[]> {
    return this.theOrderRepository.find({ relations: ['order', 'product'] });
  }

  async findOne(id: number): Promise<TheOrder | null> {
    return this.theOrderRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });
  }

  async update(id: number, updateTheOrderDto: UpdateTheOrderDto): Promise<TheOrder | null> {
    await this.theOrderRepository.update(id, updateTheOrderDto);
    return this.theOrderRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.theOrderRepository.delete(id);
  }
}
