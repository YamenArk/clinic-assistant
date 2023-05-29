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
  import { IsIn, IsNumber, IsOptional, Max, Min, Validate } from 'class-validator';
import { Patient } from './patient';
  
  @Entity({ name: 'doctorPatients' })
  export class DoctorPatient {
    @PrimaryGeneratedColumn({ type: 'bigint' })
      id: number;
  
     
        @Column({ type: 'decimal', precision: 4, scale: 2})
        @IsIn([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5])
        evaluate: number;
    
      @ManyToOne(() => Doctor, (doctor) => doctor.doctorPatient)
      public doctor: Doctor
  
      @ManyToOne(() => Patient, (patient) => patient.doctorPatient)
      public patient: Patient; // Ensure that the type of this property is Clinic
  }
  