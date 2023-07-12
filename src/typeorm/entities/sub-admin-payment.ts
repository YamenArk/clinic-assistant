import {
    Column,
      Entity,
      ManyToOne,
      PrimaryGeneratedColumn,
    } from 'typeorm';
  import {  IsNotEmpty, IsNumber } from 'class-validator';
import { Admin } from './admin';
  
  @Entity({ name: 'subAdminPayments' })
  export class SubAdminPayment {
        @PrimaryGeneratedColumn({ type: 'bigint' })
        id: number;


        @Column()
        @IsNotEmpty()
        @IsNumber()
        amount: number;

        @ManyToOne(() => Admin, (admin) => admin.payInAdvance)
        public admin: Admin; // Ensure that the type of this property is Clinic
        
        @Column({ type: 'date', nullable: false })
        @IsNotEmpty()
        createdAt: string;

  }
  