import {
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Clinic } from './clinic';
import { Patient } from './patient';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => Doctor, (doctor) => doctor.doctorClinic)
    public doctor: Doctor

    @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinic)
    public clinic: Clinic

    @ManyToOne(() => Patient, (patient) => patient.appointment)
    public patient: Patient

}
