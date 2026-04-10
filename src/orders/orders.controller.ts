import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // Override the userId with the current user's id
    const orderDto = { ...createOrderDto, userId: req.user.sub };
    return this.ordersService.create(orderDto);
  }

  @Get()
  findAll(@Request() req) {
    // Only return orders for the logged-in user
    return this.ordersService.findAllForUser(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Only return order if it belongs to the current user
    return this.ordersService.findOneForUser(+id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req) {
    // Only update order if it belongs to the current user
    return this.ordersService.updateForUser(+id, updateOrderDto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Only delete order if it belongs to the current user
    return this.ordersService.removeForUser(+id, req.user.sub);
  }
}
