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
import { IsNotEmpty, IsString } from 'class-validator';
import { Clinic } from './clinic';
import { Patient } from './patient';

@Entity({ name: 'patientMessages' })
export class PatientMessage {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ nullable: false})
    @IsNotEmpty()
    @IsString()
    message: string;

    
    @ManyToOne(() => Patient, (patient) => patient.patientMessage)
    public patient: Patient; // Ensure that the type of this property is Clinic

    @Column({ type: 'date', nullable: false })
    createdAt: string;
}