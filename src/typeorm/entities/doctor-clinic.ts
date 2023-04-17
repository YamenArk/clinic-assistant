import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Clinic } from './clinic';

@Entity({ name: 'doctorClinics' })
export class DoctorClinic {
  @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => Doctor, (doctor) => doctor.doctorClinic)
    public doctor: Doctor

    @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinic)
    public clinic: Clinic

}
