import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { SubSpecialty } from './sub-specialty';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Clinic } from './clinic';
import { Patient } from './patient';
import { Appointment } from './appointment';
import { Doctor } from './doctors';


enum TypeEnum {
  Zero = 0,
  One = 1,
}


@Entity({ name: 'patientReminders' })
export class PatientReminders {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;


   
    @ManyToOne(() => Doctor, (doctor) => doctor.patientReminders)
    public doctor: Doctor; 


    @ManyToOne(() => Clinic, (clinic) => clinic.patientReminders)
    public clinic: Clinic; 
    
    @ManyToOne(() => Appointment, (appointment) => appointment.patientReminders)
    public appointment: Appointment; 

    
    @ManyToOne(() => Patient, (patient) => patient.patientReminders)
    public patient: Patient; //

    @Column({ type: 'date', nullable: false })
    createdAt: string;
}