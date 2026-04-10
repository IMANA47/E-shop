import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TheOrder } from '../../the_orders/entities/the_order.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column('decimal', { nullable: true })
  total: number;

  @Column({ default: 'pending' })
  status: string;

  @OneToMany(() => TheOrder, (theOrder) => theOrder.order)
  theOrders: TheOrder[];

  @CreateDateColumn()
  createdAt: Date;
}
