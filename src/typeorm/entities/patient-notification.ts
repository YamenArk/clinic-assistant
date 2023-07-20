import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Patient } from './patient';



@Entity({ name: 'patientNotifications' })
export class PatientNotification {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ nullable: false})
    @IsNotEmpty()
    @IsString()
    message: string;
    
    @ManyToOne(() => Patient, (patient) => patient.patientNotification)
    public patient: Patient; // Ensure that the type of this property is Clinic
}