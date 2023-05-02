import {
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Clinic } from './clinic';
import { Secreatry } from './secretary';

@Entity({ name: 'doctorClinics' })
export class DoctorClinic {
  @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => Doctor, (doctor) => doctor.doctorClinic)
    public doctor: Doctor

    @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinic)
    public clinic: Clinic; // Ensure that the type of this property is Clinic

    @ManyToOne(() => Secreatry, (secreatry) => secreatry.doctorClinic)
    public secreatry: Secreatry

}
