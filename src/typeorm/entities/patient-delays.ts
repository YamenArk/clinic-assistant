import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Clinic } from './clinic';
import { Patient } from './patient';
import { Doctor } from './doctors';



@Entity({ name: 'patientdelays' })
export class PatientDelay {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false})
  @IsNotEmpty()
  @IsString()
  message: string;


  @ManyToOne(() => Clinic, (clinic) => clinic.patientReminders)
  public clinic: Clinic; 
  
  @ManyToOne(() => Doctor, (doctor) => doctor.patientReminders)
  public doctor: Doctor; 

  
  @ManyToOne(() => Patient, (patient) => patient.patientReminders)
  public patient: Patient; // Ensure that the type of this property is Clinic

  @Column({ type: 'date', nullable: false })
  createdAt: string;
}