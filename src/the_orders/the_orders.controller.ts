import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TheOrdersService } from './the_orders.service';
import { CreateTheOrderDto } from './dto/create-the_order.dto';
import { UpdateTheOrderDto } from './dto/update-the_order.dto';

@Controller('the-orders')
export class TheOrdersController {
  constructor(private readonly theOrdersService: TheOrdersService) {}

  @Post()
  create(@Body() createTheOrderDto: CreateTheOrderDto) {
    return this.theOrdersService.create(createTheOrderDto);
  }

  @Get()
  findAll() {
    return this.theOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.theOrdersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTheOrderDto: UpdateTheOrderDto) {
    return this.theOrdersService.update(+id, updateTheOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.theOrdersService.remove(+id);
  }
}
