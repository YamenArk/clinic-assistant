import {
    Column,
      Entity,
      JoinColumn,
      ManyToOne,
      PrimaryGeneratedColumn,
    } from 'typeorm';
  import { Doctor } from './doctors';
  import { Clinic } from './clinic';
  import { Secretary } from './secretary';
  import { IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, Max, Min, Validate } from 'class-validator';
import { Patient } from './patient';
import { Admin } from './admin';
  
  @Entity({ name: 'transctions' })
  export class Transctions {
    @PrimaryGeneratedColumn({ type: 'bigint' })
        id: number;

        @Column()
        @IsNotEmpty()
        @IsNumber()
        amountPaid: number;



        @ManyToOne(() => Doctor, (doctor) => doctor.transctions)
        public doctor: Doctor

        @ManyToOne(() => Admin, (admin) => admin.transctions)
        public admin: Admin; // Ensure that the type of this property is Clinic
  
        
        @Column({ type: 'date', nullable: false })
        @IsNotEmpty()
        createdAt: string;
  }
  