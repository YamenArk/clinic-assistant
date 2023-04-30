import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { DoctorClinic } from './doctor-clinic';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity({ name: 'clinics' })
export class Clinic {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    clinicId: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    clinicName: string;

    @Column()
    location: string;

    @Column()
    locationId: string;

    @Column()
    createdAt: Date;
  
    @Column({ nullable: true })
    phonenumber: string;

    @Column({ default: 0 })
    numDoctors: number;

    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.clinic)
    public doctorClinic: DoctorClinic[];
}
