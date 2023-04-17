import { SrvRecord } from 'dns';
import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Specialty } from './specialty';
import { Insurance } from './insurance';
import { SubSpecialty } from './sub-specialty';
import { DoctorClinic } from './doctor-clinic';

@Entity({ name: 'doctors' })
export class Doctor {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    doctorId: number;

    @Column()
    Descreption: string;

    @Column()
    active: boolean;

    @Column()
    username: string;

    @Column()
    password: string;

    
    // 1 for male 0 for femal
    @Column()
    gender: boolean; 

    @Column()
    profilePicture: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    appointmentDuring: number;

    @Column({default : "3"})
    evaluate: number;

    @Column()
    numberOfPeopleWhoVoted: number;

    @Column()
    checkupPrice: number;

    @Column({ type: 'bigint' })
    phonenumber: string;

    @Column()
    createdAt: Date;

    @ManyToMany(() => Insurance, insurance => insurance.doctor)
    @JoinTable()
    public insurance: Insurance[];

    @ManyToMany(() => SubSpecialty, subSpecialty => subSpecialty.doctor)
    @JoinTable()
    public subSpecialty: SubSpecialty[];

    
    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.doctor)
    public doctorClinic: DoctorClinic[];
}