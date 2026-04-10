import { PartialType } from '@nestjs/mapped-types';
import { CreateTheOrderDto } from './create-the_order.dto';

export class UpdateTheOrderDto extends PartialType(CreateTheOrderDto) {}
