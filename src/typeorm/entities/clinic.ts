import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { DoctorClinic } from './doctor-clinic';

@Entity({ name: 'clinics' })
export class Clinic {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    clinicId: number;

    @Column()
    clinicName: string;

    @Column()
    location: string;

    @Column()
    locationId: string;

    @Column()
    createdAt: Date;
  
    @Column()
    phonenumber: string;

    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.clinic)
    public doctorClinic: DoctorClinic[];
}
