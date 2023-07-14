import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

@Entity({ name: 'monthlySubscriptions' })
export class MonthlySubscription {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'decimal' })
    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    amountOfMoney: number;

}