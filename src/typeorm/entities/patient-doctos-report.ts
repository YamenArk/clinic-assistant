import {
    Column,
      Entity,
      ManyToOne,
      PrimaryGeneratedColumn,
    } from 'typeorm';
  import {  IsNotEmpty, IsNumber, Matches } from 'class-validator';
import { Admin } from './admin';
import { Doctor } from './doctors';
  
  @Entity({ name: 'patientDoctosReport' })
  export class PatientDoctosReport {
        @PrimaryGeneratedColumn({ type: 'bigint' })
        id: number;


        @Column()
        @IsNotEmpty()
        @IsNumber()
        numberOfPaitentWhoCame: number;

        @Column({ type: 'varchar', length: 7, nullable: false })
        @IsNotEmpty()
        @Matches(/^\d{4}-\d{2}$/)
        createdAt: string;

        @ManyToOne(() => Doctor, (doctor) => doctor.patientDoctosReport)
        public doctor: Doctor; // Ensure that the type of this property is Clinic
        
    

  }
  