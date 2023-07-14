import {
    Column,
      Entity,
      ManyToOne,
      PrimaryGeneratedColumn,
    } from 'typeorm';
  import {  IsNotEmpty, IsNumber, Matches } from 'class-validator';
import { Admin } from './admin';
  
  @Entity({ name: 'newDoctorReports' })
  export class NewDoctorReports {
        @PrimaryGeneratedColumn({ type: 'bigint' })
        id: number;


        @Column()
        @IsNotEmpty()
        @IsNumber()
        numberOfDoctors: number;

        @Column({ type: 'varchar', length: 7, nullable: false })
        @IsNotEmpty()
        @Matches(/^\d{4}-\d{2}$/)
        createdAt: string;

  }
  