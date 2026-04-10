import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: '' })
  phone: string;
  
  @Column()
  address: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
